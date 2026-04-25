package middleware

import (
	"context"
	"crypto/subtle"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthConfig mirrors server configuration for HTTP authentication.
type AuthConfig struct {
	APIKey    string
	SkipPaths []string
	OIDC      *OIDCAuthConfig
}

type OIDCAuthConfig struct {
	Enabled    bool
	AdminScope string
	Validator  *OIDCValidator
}

// APIKeyAuth enforces API key authentication via header, bearer token, or query param.
func APIKeyAuth(config AuthConfig) gin.HandlerFunc {
	skipPathSet := make(map[string]struct{}, len(config.SkipPaths))
	for _, p := range config.SkipPaths {
		skipPathSet[p] = struct{}{}
	}

	return func(c *gin.Context) {
		oidcEnabled := config.OIDC != nil && config.OIDC.Enabled && config.OIDC.Validator != nil

		// No auth configured, allow everything.
		if config.APIKey == "" && !oidcEnabled {
			c.Next()
			return
		}

		// Skip explicit paths
		if _, ok := skipPathSet[c.Request.URL.Path]; ok {
			c.Next()
			return
		}

		// Always allow health and metrics by default
		if strings.HasPrefix(c.Request.URL.Path, "/api/v1/health") || c.Request.URL.Path == "/health" || c.Request.URL.Path == "/metrics" {
			c.Next()
			return
		}

		// Allow UI static files to load (the React app handles auth prompting)
		// Also allow root "/" which redirects to /ui/
		if strings.HasPrefix(c.Request.URL.Path, "/ui") || c.Request.URL.Path == "/" {
			c.Next()
			return
		}

		// Allow public DID document resolution (did:web spec requires public access)
		if strings.HasPrefix(c.Request.URL.Path, "/api/v1/did/document/") || strings.HasPrefix(c.Request.URL.Path, "/api/v1/did/resolve/") {
			c.Next()
			return
		}

		// Allow public Knowledge Base access (no secrets, supports adoption)
		if strings.HasPrefix(c.Request.URL.Path, "/api/v1/agentic/kb/") {
			c.Set("auth_level", "public")
			c.Next()
			return
		}

		// Connector routes use their own ConnectorTokenAuth middleware — skip global API key check.
		// Security: ConnectorTokenAuth enforces X-Connector-Token with constant-time comparison,
		// plus per-route ConnectorCapabilityCheck for fine-grained access control.
		if strings.HasPrefix(c.Request.URL.Path, "/api/v1/connector/") {
			c.Next()
			return
		}

		apiKey := ""

		// Preferred: X-API-Key header
		apiKey = c.GetHeader("X-API-Key")

		// Fallback: Authorization: Bearer <token>
		if apiKey == "" {
			authHeader := c.GetHeader("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				apiKey = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		// SSE/WebSocket friendly: api_key query parameter
		if apiKey == "" {
			apiKey = c.Query("api_key")
		}

		if config.APIKey != "" && subtle.ConstantTimeCompare([]byte(apiKey), []byte(config.APIKey)) == 1 {
			// Set auth level for downstream handlers (used by agentic API for filtering)
			c.Set("auth_level", "api_key")
			c.Next()
			return
		}

		if oidcEnabled && apiKey != "" {
			principal, err := config.OIDC.Validator.ValidateToken(apiKey)
			if err == nil {
				c.Set("auth_level", "oidc")
				c.Set("auth_subject", principal.Subject)
				c.Set("auth_scopes", principal.Scopes)
				if principal.AgentID != "" {
					c.Set("auth_agent_id", principal.AgentID)
				}
				if config.OIDC.AdminScope != "" {
					_, isAdmin := principal.Scopes[config.OIDC.AdminScope]
					c.Set("auth_admin", isAdmin)
				}
				c.Next()
				return
			}
		}

		// Set auth level as public for failed auth (used by smart 404 and agentic handlers)
		c.Set("auth_level", "public")
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "invalid or missing credentials. Provide an API key via X-API-Key header, Authorization: Bearer <token>, or ?api_key= query param",
			"help": map[string]string{
				"kb":             "GET /api/v1/agentic/kb/topics (public, no auth required)",
				"guide":          "GET /api/v1/agentic/kb/guide?goal=<your goal> (public)",
				"api_discovery":  "GET /api/v1/agentic/discover (requires auth)",
				"agent_discovery": "GET /api/v1/discovery/capabilities (requires auth — lists live agents, reasoners, skills)",
			},
		})
		return
	}
}

// AdminTokenAuth enforces a separate admin token for admin routes.
// If adminToken is empty, the middleware is a no-op (falls back to global API key auth).
// Admin tokens must be sent via the X-Admin-Token header only (not Bearer) to avoid
// collision with the API key Bearer token namespace.
func AdminTokenAuth(adminToken string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if authAdmin, ok := c.Get("auth_admin"); ok {
			if isAdmin, ok := authAdmin.(bool); ok && isAdmin {
				c.Next()
				return
			}
		}

		if adminToken == "" {
			c.Next()
			return
		}

		token := c.GetHeader("X-Admin-Token")

		if subtle.ConstantTimeCompare([]byte(token), []byte(adminToken)) != 1 {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "forbidden",
				"message": "admin token required for this operation (use X-Admin-Token header)",
			})
			return
		}

		c.Next()
	}
}

func ValidateOIDCToken(ctx context.Context, validator *OIDCValidator, token string) (*Principal, error) {
	return validator.ValidateToken(token)
}

package middleware

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
)

type OIDCTokenClaims struct {
	Scope string `json:"scope"`
	Extra map[string]any `json:"-"`
	jwt.RegisteredClaims
}

type Principal struct {
	Subject string
	AgentID string
	Scopes  map[string]struct{}
}

type OIDCValidator struct {
	agentIDClaim string
	audience     string
	issuer       string
	keyfunc      keyfunc.Keyfunc
}

type oidcDiscovery struct {
	Issuer  string `json:"issuer"`
	JwksURI string `json:"jwks_uri"`
}

func NewOIDCValidator(ctx context.Context, issuer, jwksURL, audience, agentIDClaim string) (*OIDCValidator, error) {
	resolvedIssuer := strings.TrimRight(issuer, "/")
	resolvedJWKS := strings.TrimSpace(jwksURL)

	if resolvedIssuer == "" && resolvedJWKS == "" {
		return nil, errors.New("oidc issuer or jwks_url is required")
	}

	if resolvedIssuer != "" && resolvedJWKS == "" {
		discoveryURL := resolvedIssuer + "/.well-known/openid-configuration"

		req, err := http.NewRequestWithContext(ctx, http.MethodGet, discoveryURL, nil)
		if err != nil {
			return nil, err
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("oidc discovery returned status %d", resp.StatusCode)
		}

		var discovery oidcDiscovery
		if err := json.NewDecoder(resp.Body).Decode(&discovery); err != nil {
			return nil, err
		}

		if discovery.Issuer == "" || discovery.JwksURI == "" {
			return nil, errors.New("oidc discovery response missing issuer or jwks_uri")
		}

		resolvedIssuer = strings.TrimRight(discovery.Issuer, "/")
		resolvedJWKS = discovery.JwksURI
	}

	kf, err := keyfunc.NewDefaultCtx(ctx, []string{resolvedJWKS})
	if err != nil {
		return nil, err
	}

	return &OIDCValidator{
		agentIDClaim: strings.TrimSpace(agentIDClaim),
		audience:     audience,
		issuer:       resolvedIssuer,
		keyfunc:      kf,
	}, nil
}

func (v *OIDCValidator) ValidateToken(token string) (*Principal, error) {
	claims := &OIDCTokenClaims{}
	parsed, err := jwt.ParseWithClaims(token, claims, v.keyfunc.Keyfunc, jwt.WithValidMethods([]string{
		"RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "EdDSA",
	}))
	if err != nil {
		return nil, err
	}
	if !parsed.Valid {
		return nil, errors.New("invalid oidc token")
	}
	if v.issuer != "" && strings.TrimRight(claims.Issuer, "/") != v.issuer {
		return nil, fmt.Errorf("unexpected issuer %q", claims.Issuer)
	}
	if v.audience != "" {
		matched := false
		for _, aud := range claims.Audience {
			if aud == v.audience {
				matched = true
				break
			}
		}
		if !matched {
			return nil, errors.New("token audience mismatch")
		}
	}
	if claims.ExpiresAt != nil && claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, errors.New("token expired")
	}

	scopes := make(map[string]struct{})
	for _, scope := range strings.Fields(claims.Scope) {
		scopes[scope] = struct{}{}
	}

	agentID := stringClaim(claims.Extra, v.agentIDClaim)
	if agentID == "" {
		agentID = claims.Subject
	}

	return &Principal{
		Subject: claims.Subject,
		AgentID: agentID,
		Scopes:  scopes,
	}, nil
}

func (c *OIDCTokenClaims) UnmarshalJSON(data []byte) error {
	type alias OIDCTokenClaims
	var raw map[string]any
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	var parsed alias
	if err := json.Unmarshal(data, &parsed); err != nil {
		return err
	}

	*c = OIDCTokenClaims(parsed)
	c.Extra = raw
	return nil
}

func stringClaim(claims map[string]any, key string) string {
	if claims == nil || key == "" {
		return ""
	}

	value, ok := claims[key]
	if !ok || value == nil {
		return ""
	}

	switch typed := value.(type) {
	case string:
		return strings.TrimSpace(typed)
	case fmt.Stringer:
		return strings.TrimSpace(typed.String())
	default:
		return strings.TrimSpace(fmt.Sprint(typed))
	}
}

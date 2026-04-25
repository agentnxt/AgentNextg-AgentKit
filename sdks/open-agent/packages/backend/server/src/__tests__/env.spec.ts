import test from 'ava';

import { Env } from '../env';

const envs = { ...process.env };
test.beforeEach(() => {
  process.env = { ...envs };
});

test('should init env', t => {
  t.true(globalThis.env.testing);
});

test('should read NODE_ENV', t => {
  process.env.NODE_ENV = 'test';
  t.deepEqual(
    ['test', 'development', 'production'].map(envVal => {
      process.env.NODE_ENV = envVal;
      const env = new Env();
      return env.NODE_ENV;
    }),
    ['test', 'development', 'production']
  );

  t.throws(
    () => {
      process.env.NODE_ENV = 'unknown';
      new Env();
    },
    {
      message:
        'Invalid NODE_ENV environment. `unknown` is not a valid NODE_ENV value.',
    }
  );
});

test('should read NAMESPACE', t => {
  t.deepEqual(
    ['dev', 'beta', 'production'].map(envVal => {
      process.env.OPEN_AGENT_ENV = envVal;
      const env = new Env();
      return env.NAMESPACE;
    }),
    ['dev', 'beta', 'production']
  );

  t.throws(() => {
    process.env.OPEN_AGENT_ENV = 'unknown';
    new Env();
  });
});

test('should read DEPLOYMENT_TYPE', t => {
  t.deepEqual(
    ['agent'].map(envVal => {
      process.env.DEPLOYMENT_TYPE = envVal;
      const env = new Env();
      return env.DEPLOYMENT_TYPE;
    }),
    ['agent']
  );

  t.throws(() => {
    process.env.DEPLOYMENT_TYPE = 'unknown';
    new Env();
  });
});

test('should read FLAVOR', t => {
  t.deepEqual(
    ['allinone', 'graphql', 'script'].map(envVal => {
      process.env.SERVER_FLAVOR = envVal;
      const env = new Env();
      return env.FLAVOR;
    }),
    ['allinone', 'graphql', 'script']
  );

  t.throws(
    () => {
      process.env.SERVER_FLAVOR = 'unknown';
      new Env();
    },
    {
      message:
        'Invalid value "unknown" for environment variable SERVER_FLAVOR, expected one of ["allinone","graphql","script"]',
    }
  );
});

test('should read platform', t => {
  t.deepEqual(
    ['gcp', 'unknown'].map(envVal => {
      process.env.DEPLOYMENT_PLATFORM = envVal;
      const env = new Env();
      return env.platform;
    }),
    ['gcp', 'unknown']
  );

  t.notThrows(() => {
    process.env.PLATFORM = 'unknown';
    new Env();
  });
});

test('should tell flavors correctly', t => {
  process.env.SERVER_FLAVOR = 'allinone';
  t.deepEqual(new Env().flavors, {
    graphql: true,
    script: false,
  });

  process.env.SERVER_FLAVOR = 'graphql';
  t.deepEqual(new Env().flavors, {
    graphql: true,
    script: false,
  });

  process.env.SERVER_FLAVOR = 'script';
  t.deepEqual(new Env().flavors, {
    graphql: false,
    script: true,
  });
});

test('should tell namespaces correctly', t => {
  process.env.OPEN_AGENT_ENV = 'dev';
  t.deepEqual(new Env().namespaces, {
    canary: true,
    beta: false,
    production: false,
  });

  process.env.OPEN_AGENT_ENV = 'beta';
  t.deepEqual(new Env().namespaces, {
    canary: false,
    beta: true,
    production: false,
  });

  process.env.OPEN_AGENT_ENV = 'production';
  t.deepEqual(new Env().namespaces, {
    canary: false,
    beta: false,
    production: true,
  });
});

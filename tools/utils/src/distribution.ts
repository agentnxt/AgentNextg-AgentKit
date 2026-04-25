import { PackageList, type PackageName } from './yarn';

export const PackageToDistribution = new Map<
  PackageName,
  BUILD_CONFIG_TYPE['distribution']
>([['@afk/web', 'web']]);

export const AliasToPackage = new Map<string, PackageName>([
  ['web', '@afk/web'],
  ['server', '@afk/server'],
  ['gql', '@afk/graphql'],
  ...PackageList.map(
    pkg => [pkg.name.split('/').pop()!, pkg.name] as [string, PackageName]
  ),
]);

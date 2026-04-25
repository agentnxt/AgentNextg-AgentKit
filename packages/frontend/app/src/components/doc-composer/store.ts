import { StoreExtensionManager } from '@blocksuite/affine/ext-loader';
import { getInternalStoreExtensions } from '@blocksuite/affine/extensions/store';

interface Configure {
  init: () => Configure;
  value: StoreExtensionManager;
}

class StoreProvider {
  static instance: StoreProvider | null = null;
  static getInstance() {
    if (!StoreProvider.instance) {
      StoreProvider.instance = new StoreProvider();
    }
    return StoreProvider.instance;
  }

  private readonly _manager: StoreExtensionManager;

  constructor() {
    this._manager = new StoreExtensionManager([
      ...getInternalStoreExtensions(),
    ]);
  }

  get config(): Configure {
    return {
      init: this._initDefaultConfig,
      value: this._manager,
    };
  }

  get value(): StoreExtensionManager {
    return this._manager;
  }

  private readonly _initDefaultConfig = () => {
    return this.config;
  };
}

export function getStoreManager() {
  return StoreProvider.getInstance();
}

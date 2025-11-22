import { _decorator, Asset, AssetManager, assetManager } from 'cc'

export class ResourceManager  {
    public static Instance: ResourceManager = null

    public Init(): void {
        if (ResourceManager.Instance === null){
            ResourceManager.Instance = new ResourceManager()
        }
    }

    public async AwaitGetAsset<T extends Asset>(bundleName: string, assetPath: string, assetType: new () => T) {
        let bundle: AssetManager.Bundle = assetManager.getBundle(bundleName)
        if (!bundle) {
            bundle = await this.AwaitLoadBundle(bundleName)
            if (!bundle) {
                return null
            }
        }
        let asset = await this.AwaitLoadAsset(bundle, assetPath, assetType)
        return asset
    }

    public async AwaitLoadBundle(bundleName: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(bundleName, (err, buldle) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(buldle)
                }
            })
        })
    }

    private async AwaitLoadAsset<T extends Asset>(bundle: AssetManager.Bundle, assetPath: string, assetType: new () => T): Promise<T | null> {
        return new Promise((resolve, reject) => {
            bundle.load(assetPath, assetType, (err, asset) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(asset)
                }
            })
        })
    }
}


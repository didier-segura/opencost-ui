import client from "./api_client";

class AssetService {
  async fetchAssets(window) {
    const params = {
      window,
    };
    const result = await client.get("/assets", { params });
    return result.data;
  }
}

export default new AssetService();

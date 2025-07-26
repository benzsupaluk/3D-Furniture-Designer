import { Dimensions } from "@/types/common";
import { useState, useEffect } from "react";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Box3, Vector3 } from "three";

interface ModelData {
  scene: any;
  dimensions: Dimensions;
}

interface GLTFResult {
  scene: any;
  animations: any[];
  scenes: any[];
  cameras: any[];
  asset: any;
}

class ModelPreloader {
  private cache = new Map<string, ModelData>();
  private loadingPromises = new Map<string, Promise<ModelData>>();
  private errorCache = new Set<string>(); // Track failed loads to prevent retries
  private gltfLoader = new GLTFLoader();

  // Preload a model and calculate its dimensions
  async preloadModel(modelPath: string): Promise<ModelData> {
    // Check if already cached
    if (this.cache.has(modelPath)) {
      return this.cache.get(modelPath)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(modelPath)) {
      return this.loadingPromises.get(modelPath)!;
    }

    // Check if previously failed
    if (this.errorCache.has(modelPath)) {
      throw new Error(`Model ${modelPath} has failed to load previously`);
    }

    // Create loading promise
    const loadPromise = new Promise<ModelData>((resolve, reject) => {
      this.gltfLoader.load(
        modelPath,
        (gltf: GLTFResult) => {
          try {
            // Calculate dimensions from the loaded model
            const box = new Box3().setFromObject(gltf.scene);
            const size = new Vector3();
            box.getSize(size);

            const dimensions: Dimensions = {
              width: size.x,
              height: size.y,
              depth: size.z,
            };

            const modelData: ModelData = {
              scene: gltf.scene,
              dimensions,
            };

            // Cache the result
            this.cache.set(modelPath, modelData);
            this.loadingPromises.delete(modelPath);
            resolve(modelData);
          } catch (error) {
            console.error(`Error calculating dimensions for ${modelPath}:`, error);
            this.errorCache.add(modelPath);
            this.loadingPromises.delete(modelPath);
            reject(error);
          }
        },
        undefined, // onProgress
        (error: unknown) => {
          console.error(`Failed to load model ${modelPath}:`, error);
          this.errorCache.add(modelPath);
          this.loadingPromises.delete(modelPath);
          reject(error);
        }
      );
    });

    this.loadingPromises.set(modelPath, loadPromise);
    return loadPromise;
  }

  // Store preloaded model data
  storeModel(modelPath: string, scene: any, dimensions: Dimensions): void {
    const modelData: ModelData = {
      scene,
      dimensions,
    };
    this.cache.set(modelPath, modelData);
  }

  getCachedModel(modelPath: string): ModelData | null {
    return this.cache.get(modelPath) || null;
  }

  isCached(modelPath: string): boolean {
    return this.cache.has(modelPath);
  }

  isLoading(modelPath: string): boolean {
    return this.loadingPromises.has(modelPath);
  }

  hasError(modelPath: string): boolean {
    return this.errorCache.has(modelPath);
  }

  markAsFailed(modelPath: string): void {
    this.errorCache.add(modelPath);
  }

  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
    this.errorCache.clear();
  }

  // Get default dimensions for furniture types
  getDefaultDimensions(type?: string): Dimensions {
    switch (type) {
      case "chair":
        return { width: 0.6, height: 0.8, depth: 0.6 };
      case "table":
        return { width: 1.2, height: 0.8, depth: 0.8 };
      case "sofa":
        return { width: 2.0, height: 0.8, depth: 0.9 };
      case "bed":
        return { width: 1.6, height: 0.6, depth: 2.0 };
      case "cabinet":
        return { width: 1.0, height: 2.0, depth: 0.5 };
      case "desk":
        return { width: 1.5, height: 0.75, depth: 0.8 };
      default:
        return { width: 1.0, height: 1.0, depth: 1.0 };
    }
  }

  // Clean up unused models to prevent memory leaks
  cleanupUnusedModels(usedModelPaths: string[]): void {
    const unusedPaths = Array.from(this.cache.keys()).filter(
      path => !usedModelPaths.includes(path)
    );
    
    unusedPaths.forEach(path => {
      this.cache.delete(path);
    });
  }
}

// Create a singleton instance
export const modelPreloader = new ModelPreloader();

// Hook for preloading models in React components
export const useModelPreloader = (modelPath: string) => {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!modelPath) return;

    const loadModel = async () => {
      setIsLoading(true);
      try {
        // Check if already cached
        const cached = modelPreloader.getCachedModel(modelPath);
        if (cached) {
          setModelData(cached);
          setIsLoading(false);
          return;
        }

        // Check if this model has failed to load before
        if (modelPreloader.hasError(modelPath)) {
          console.warn(`Model ${modelPath} has failed to load previously, using defaults`);
          const defaultDimensions = modelPreloader.getDefaultDimensions();
          setModelData({
            scene: null,
            dimensions: defaultDimensions,
          });
          setIsLoading(false);
          return;
        }

        // Try to preload the model
        const data = await modelPreloader.preloadModel(modelPath);
        setModelData(data);
      } catch (error) {
        console.error("Failed to load model:", error);
        modelPreloader.markAsFailed(modelPath);
        // Use default dimensions as fallback
        const defaultDimensions = modelPreloader.getDefaultDimensions();
        setModelData({
          scene: null,
          dimensions: defaultDimensions,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, [modelPath]);

  return { modelData, isLoading };
};

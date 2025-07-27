export type SpaceType = "bedroom" | "living_room" | "kitchen";
export type SpaceStyle = "modern" | "minimalist" | "industrial_loft";

export type SpaceGeneratorResponse = {
  data: string;
};

export type SpaceGeneratorRequest = {
  model: string;
  imageUrl: string;
  spaceType: string;
  spaceStyle: string;
  renovateType: string;
};

type PollStatus = "processing" | "success" | "failed";
export type PoolResult = {
  status: PollStatus;
  result: string[];
  webhook: string;
  progress: number;
};

export type PoolResultResponse = {
  data: PoolResult;
};

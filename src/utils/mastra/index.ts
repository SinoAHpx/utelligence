
import { Mastra } from '@mastra/core';
import { dataVisualizationAgent } from './agents/dataVisualizationAgent';

export const mastra = new Mastra({
    agents: { dataVisualizationAgent }
})

import { Mastra } from '@mastra/core';
import { dataVisualizationAgent } from './agents/data-visualization-agent';

export const mastra = new Mastra({
    agents: { dataVisualizationAgent }
})
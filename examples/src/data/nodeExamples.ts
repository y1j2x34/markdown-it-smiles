import scenarios from 'virtual:markdown-it-smiles-node-examples';

export interface NodeScenarioSample {
  id: string;
  title: string;
  description: string;
  markdown: string;
  options: Record<string, unknown>;
  errors?: string[];
  html: string;
}

const typedScenarios = scenarios as NodeScenarioSample[];

export default typedScenarios;

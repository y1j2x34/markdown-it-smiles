declare module '*.css';

declare module 'virtual:markdown-it-smiles-node-examples' {
  interface NodeScenarioSample {
    id: string;
    title: string;
    description: string;
    markdown: string;
    options: Record<string, unknown>;
    errors?: string[];
    html: string;
  }

  const scenarios: NodeScenarioSample[];
  export default scenarios;
}

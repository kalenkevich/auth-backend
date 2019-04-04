export default interface ConnectorInterface {
  settings: any;
  connect(): Promise<any>;
}

export class EntityPropertiesNotFoundError extends Error {
  constructor(propertyName: string) {
    super(
      `Property "${propertyName}" was not found in the entity. Make sure your query is correct.`,
    );
    this.name = 'EntityPropertiesNotFoundError';
  }
}

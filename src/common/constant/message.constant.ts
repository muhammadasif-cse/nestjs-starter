import { ActionEnum } from '../enum/action.enum';

export const NOT_FOUND = (name: string) =>
  `${name} not found. Please verify the details and try again.`;

export const EXISTS = (name: string) =>
  `${name} already exists. Please choose a different one.`;

export const NOT_EXIST = (name: string) =>
  `${name} does not exist. Please double-check the information and try again.`;

export const INVALID = (name: string) =>
  `${name} is invalid. Please correct it and try again.`;

export const REQUIRED = (name: string) =>
  `${name} is required. Please provide it.`;

export const SUCCESS = (action: ActionEnum, name: string) => {
  switch (action) {
    case ActionEnum.GET:
      return `${name} has been successfully retrieved.`;
    case ActionEnum.CREATE:
      return `${name} has been successfully created.`;
    case ActionEnum.UPDATE:
      return `${name} has been successfully updated.`;
    case ActionEnum.DELETE:
      return `${name} has been successfully deleted.`;
    default:
      return `${name} has been successfully processed.`;
  }
};

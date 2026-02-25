import { DepartmentTypeahead } from './DepartmentTypeahead';
import { lookupDepartments } from '@frontend/lib/ardaClient';
import { createTypeaheadTests } from '@frontend/test-utils/typeahead-test-factory';

jest.mock('@/lib/ardaClient', () => ({
  lookupDepartments: jest.fn(),
}));

createTypeaheadTests({
  Component: DepartmentTypeahead,
  lookupMock: lookupDepartments as jest.Mock,
  displayName: 'DepartmentTypeahead',
  entityName: 'department',
  defaultPlaceholder: 'Search for department',
  newOptionLabel: /New department:/,
  sampleValues: ['Cardiology', 'Cardiovascular'],
});

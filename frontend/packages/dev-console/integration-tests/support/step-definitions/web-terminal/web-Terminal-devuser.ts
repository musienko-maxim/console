import { When, Then, Given } from 'cypress-cucumber-preprocessor/steps';
import { initTerminalPage } from '../../pages/web-terminal/initTerminal-page';
import { searchResource } from '../../pages/search-resources/search-page';
import { devWorkspacePage } from '../../pages/devworspace/devworkspacePage';
import { devWorkspaceStatuses, switchPerspective } from '../../constants';
import { projectNameSpace, perspective } from '../../pages';

import { guidedTour } from '../../../../../integration-tests-cypress/views/guided-tour';

Given('user has logged in as basic user', () => {
  // temporary solution for login as developer user
  cy.logout();
  cy.login(Cypress.env('DEV_USER_IDP') || 'developer', Cypress.env('DEV_USER_NAME'), Cypress.env('DEV_USER_PASSSWORD'));
  guidedTour.close();
  perspective.switchTo(switchPerspective.Developer);
});

When('user selects Create Project from Project drop down menu', () => {
  initTerminalPage.clickOnProjectDropDawn();
  initTerminalPage.selectCreateProjectButton();
});

When('user enters project name {string}', (projectName: string) => {
  initTerminalPage.typeProjectName(projectName);
});

When('user clicks on Submit button', () => {
  initTerminalPage.clickStartButton();
});
Then(
  'user will see the terminal instance for developer namespace {string}',
  (nameSpace: string) => {
    projectNameSpace.selectProject(nameSpace);
    searchResource.searchResourceByNameAsAdmin('DevWorkspace');
    searchResource.selectSearchedItem('terminal');
    devWorkspacePage.verifyDevWsResourceStatus(devWorkspaceStatuses.running);
    cy.exec(`oc delete namespace ${nameSpace}`, { failOnNonZeroExit: true });
  },
);

When('user selects {string} from Project drop down menu', (projectName: string) => {
  initTerminalPage.clickOnProjectDropDawn();
  initTerminalPage.selectProject(projectName);
  initTerminalPage.clickStartButton();
});

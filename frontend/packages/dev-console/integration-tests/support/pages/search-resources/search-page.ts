import { adminNavigationBar, devNavigationMenu } from '../../constants';
import { navigateTo } from '../../pages';
import { adminNavigationMenuPO } from '../../pageObjects';
import { navigateToAdminMenu } from '../app';
const dataTestIdPref: string = 'data-test-id';

function performResourceSearching(resourceName: string) {
  cy.get('div')
    .contains('Resources')
    .click();
  cy.byLegacyTestID('dropdown-text-filter')
    .clear()
    .type(resourceName);
  cy.get(`input[id$=${resourceName}]`).click();
}

export const searchResource = {
  searchResourceByNameAsDev: (resourceName: string) => {
    navigateTo(devNavigationMenu.Search);
    performResourceSearching(resourceName)
  },

  searchResourceByNameAsAdmin: (resourceName: string) => {
    //check Home menu is expanded or not
    cy.get(`${adminNavigationMenuPO.home.main}>button`)
      .should('have.attr', 'aria-expanded')
      .and('equal', 'false')
      .then((expanded) => {
        if (expanded) {
          navigateToAdminMenu(adminNavigationBar.Home);
        }
      });
    cy.get(adminNavigationMenuPO.home.search).click();
    performResourceSearching(resourceName);
  },

  verifyItemInSearchResults: (item: string) => {
    cy.byLegacyTestID(`${item}`).should('be.visible');
  },

  verifyItemInSearchResultsByPreffixName: (item: string) => {
    cy.get(`[${dataTestIdPref}^=${item}]`).should('be.visible');
  },

  selectSearchedItem: (searchedItem: string) => {
    cy.get(`[${dataTestIdPref}^=${searchedItem}]`)
      .should('be.visible')
      .click();
  },
};

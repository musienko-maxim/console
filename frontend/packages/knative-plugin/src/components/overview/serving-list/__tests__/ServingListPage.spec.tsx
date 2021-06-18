import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { NamespaceBar } from '@console/internal/components/namespace';
import { MultiTabListPage } from '@console/shared';
import { RevisionModel } from '../../../../models';
import ServingListPage from '../ServingListsPage';

jest.mock('react-i18next', () => {
  const reactI18next = require.requireActual('react-i18next');
  return {
    ...reactI18next,
    useTranslation: () => ({ t: (key) => key }),
  };
});

let servingListPageProps: React.ComponentProps<typeof ServingListPage>;
let wrapper: ShallowWrapper;
const i18nNS = 'knative-plugin';

describe('ServingListPage', () => {
  beforeEach(() => {
    servingListPageProps = {
      match: {
        isExact: true,
        path: `/serving/ns/:ns/${RevisionModel.plural}`,
        url: 'serving/ns/my-project/revisions',
        params: {
          ns: 'my-project',
        },
      },
    };
    wrapper = shallow(<ServingListPage {...servingListPageProps} />);
  });

  it('should render NamespaceBar and MultiTabListPage', () => {
    expect(wrapper.find(NamespaceBar)).toHaveLength(1);
    expect(wrapper.find(MultiTabListPage)).toHaveLength(1);
  });

  it('should render MultiTabListPage with all pages and menuActions', () => {
    const multiTablistPage = wrapper.find(MultiTabListPage);
    expect(multiTablistPage.props().title).toEqual(`${i18nNS}~Serving`);
    expect(multiTablistPage.props().pages).toHaveLength(3);
    expect(Object.keys(multiTablistPage.props().menuActions)).toHaveLength(1);
    expect(multiTablistPage.props().menuActions.service).toBeDefined();
  });
});

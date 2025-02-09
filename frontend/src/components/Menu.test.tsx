import { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { DocumentNode } from 'graphql';
import {
  GET_TOP_MOVIES,
  GET_TRENDING_MOVIES,
  GET_UPCOMING_MOVIES,
  GET_TOP_TV,
} from '../graphql/queries';
import Menu from './Menu';

type Mock = {
  request: {
    query: DocumentNode; // Represents the GraphQL query
    variables?: Record<string, any>; // Represents the variables object
  };
  result?: {
    data?: Record<string, any>; // Represents the response data structure
  };
  error?: Error; // Represents any potential errors
};

const mocks: Mock[] = [
  {
    request: { query: GET_TOP_MOVIES, variables: {} },
    result: {
      data: {
        topMovies: [
          { id: 1, title: 'Movie 1' },
          { id: 2, title: 'Movie 2' },
        ],
      },
    },
  },
  {
    request: { query: GET_TRENDING_MOVIES, variables: {} },
    result: {
      data: {
        trendingMovies: [
          { id: 3, title: 'Trending Movie 1' },
          { id: 4, title: 'Trending Movie 2' },
        ],
      },
    },
  },
  {
    request: { query: GET_UPCOMING_MOVIES, variables: {} },
    result: {
      data: {
        upcomingMovies: [
          { id: 5, title: 'Upcoming Movie 1' },
          { id: 6, title: 'Upcoming Movie 2' },
        ],
      },
    },
  },
  {
    request: { query: GET_TOP_TV, variables: {} },
    result: {
      data: {
        topTv: [
          { id: 7, title: 'Top TV Show 1' },
          { id: 8, title: 'Top TV Show 2' },
        ],
      },
    },
  },
];

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Menu Component', () => {
  const setShowMenuMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderMenu = (mock: Mock[], showMenu: boolean) => {
    render(
      <MockedProvider mocks={mock} addTypename={false}>
        <MemoryRouter>
          <Menu showMenu={showMenu} setShowMenu={setShowMenuMock} />
        </MemoryRouter>
      </MockedProvider>
    );
  };

  it('renders correctly when showMenu is true', () => {
    renderMenu(mocks, true);

    expect(screen.getByText('IMDB')).toBeInTheDocument();
    expect(screen.getByText('Movies')).toBeInTheDocument();
    expect(screen.getByText('TV Shows')).toBeInTheDocument();
    expect(screen.getByText('Watch')).toBeInTheDocument();
  });

  it('does not render menu content when showMenu is false', () => {
    renderMenu(mocks, false);

    expect(screen.queryByText('Movies')).not.toBeVisible();
  });

  it('closes the menu when the close button is clicked', () => {
    renderMenu(mocks, true);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(setShowMenuMock).toHaveBeenCalledWith(false);
  });

  it('renders loading state', async () => {
    renderMenu(mocks, true);

    await act(async () => {
      const link = screen.getByTestId('menuLink0');
      fireEvent.click(link);
    });

    expect(screen.getByTestId('status')).toBeInTheDocument();
  });

  it('renders menu with fetched data', async () => {
    renderMenu(mocks, true);

    await waitFor(() => {
      const movieLinks = screen.getAllByRole('link', { name: /movie/i });
      expect(movieLinks).toHaveLength(4);
      expect(screen.getByTestId('close')).toBeInTheDocument();
    });
  });

  it('fetches and navigates to the correct list when a menu item is clicked', async () => {
    renderMenu(mocks, true);

    const topMoviesLink = screen.getByText('Top 100 Movies');
    fireEvent.click(topMoviesLink);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/listDetails', expect.anything());
    });
  });

  it('displays error messages when queries fail', async () => {
    const errorMocks = [
      {
        request: { query: GET_TOP_MOVIES, variables: { page: 1 } },
        error: new Error('Failed to fetch top movies'),
      },
    ];

    renderMenu(errorMocks, true);

    await act(async () => {
      const link = screen.getByTestId('menuLink0');
      fireEvent.click(link);
    });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});

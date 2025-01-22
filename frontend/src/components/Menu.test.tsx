import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';
import Menu from './Menu';
import {
  GET_TOP_MOVIES,
  GET_TRENDING_MOVIES,
  GET_UPCOMING_MOVIES,
  GET_TOP_TV,
} from '../graphql/queries';

// Mock data for Apollo queries
const mocks = [
  {
    request: { query: GET_TOP_MOVIES },
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
    request: { query: GET_TRENDING_MOVIES },
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
    request: { query: GET_UPCOMING_MOVIES },
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
    request: { query: GET_TOP_TV },
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

describe.only('Menu Component', () => {
  const setShowMenuMock = vi.fn();

  beforeEach(() => {
    setShowMenuMock.mockClear();
  });

  it('renders correctly when showMenu is true', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Menu showMenu={true} setShowMenu={setShowMenuMock} />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByText('IMDB')).toBeInTheDocument();
    expect(screen.getByText('Movies')).toBeInTheDocument();
    expect(screen.getByText('TV Shows')).toBeInTheDocument();
    expect(screen.getByText('Watch')).toBeInTheDocument();
  });

  it('does not render menu content when showMenu is false', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Menu showMenu={false} setShowMenu={setShowMenuMock} />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.queryByText('Movies')).not.toBeInTheDocument();
  });

  it('closes the menu when the close button is clicked', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Menu showMenu={true} setShowMenu={setShowMenuMock} />
        </MemoryRouter>
      </MockedProvider>
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(setShowMenuMock).toHaveBeenCalledWith(false);
  });

  it('fetches and navigates to the correct list when a menu item is clicked', async () => {
    const navigateMock = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => navigateMock,
    }));

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Menu showMenu={true} setShowMenu={setShowMenuMock} />
        </MemoryRouter>
      </MockedProvider>
    );

    const topMoviesLink = screen.getByText('Top 100 Movies');
    fireEvent.click(topMoviesLink);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/listDetails', expect.anything());
    });
  });

  it('displays error messages when queries fail', async () => {
    const errorMocks = [
      {
        request: { query: GET_TOP_MOVIES },
        error: new Error('Failed to fetch top movies'),
      },
    ];

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <MemoryRouter>
          <Menu showMenu={true} setShowMenu={setShowMenuMock} />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch top movies')).toBeInTheDocument();
    });
  });

  it('shows loading spinner when queries are loading', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <MemoryRouter>
          <Menu showMenu={true} setShowMenu={setShowMenuMock} />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

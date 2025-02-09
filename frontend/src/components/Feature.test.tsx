import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { GET_TRENDING } from '../graphql/queries';
import Feature from './Feature';

// Mock GraphQL response
const mocks = [
  {
    request: {
      query: GET_TRENDING,
    },
    result: {
      data: {
        trendingAll: [
          {
            id: '1',
            title: 'Trending Movie 1',
            overview: 'This is a trending movie.',
            backdrop_path: '/backdrop1.jpg',
            poster_path: '/poster1.jpg',
          },
          {
            id: '2',
            title: 'Trending Movie 2',
            overview: 'This is another trending movie.',
            backdrop_path: '/backdrop2.jpg',
            poster_path: '/poster2.jpg',
          },
        ],
      },
    },
  },
];
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom'); // Import actual implementation
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Feature Component', () => {
  const renderComponent = () =>
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Feature />
        </MemoryRouter>
      </MockedProvider>
    );

  it('renders loading state initially', () => {
    renderComponent();

    expect(screen.getByTestId('status')).toBeInTheDocument();
  });

  it('renders trending items when data is fetched', async () => {
    renderComponent();

    await waitFor(() => {
      const trendingMovies = screen.getAllByText(/Trending Movie/i);
      expect(trendingMovies[0]).toBeInTheDocument();
      expect(trendingMovies[1]).toBeInTheDocument();
    });
  });

  it('renders error message if query fails', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_TRENDING,
        },
        error: new Error('Failed to fetch'),
      },
    ];

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <MemoryRouter>
          <Feature />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('handles "Next" button click to change index', async () => {
    renderComponent();

    await waitFor(() => {
      const trendingMovies = screen.getAllByText(/Trending Movie/i);
      expect(trendingMovies[0]).toBeInTheDocument();
    });

    const nextButton = screen.getByTestId('nextBtn');
    fireEvent.click(nextButton);

    await waitFor(() => {
      const trendingMovies = screen.getAllByText(/Trending Movie/i);
      expect(trendingMovies[1]).toBeInTheDocument();
    });
  });

  it('handles "Previous" button click to change index', async () => {
    renderComponent();

    await waitFor(() => {
      const trendingMovies = screen.getAllByText(/Trending Movie/i);
      expect(trendingMovies[1]).toBeInTheDocument();
    });

    const prevButton = screen.getByTestId('prevBtn');
    fireEvent.click(prevButton);

    await waitFor(() => {
      const trendingMovies = screen.getAllByText(/Trending Movie/i);
      expect(trendingMovies[0]).toBeInTheDocument();
    });
  });

  it('navigates to trailer page on item click', async () => {
    renderComponent();

    await waitFor(() => {
      const trendingMovies = screen.getAllByText(/Trending Movie/i);
      expect(trendingMovies[1]).toBeInTheDocument();
    });

    const trendingMovies = screen.getAllByText(/Trending Movie/i);
    const firstItem = trendingMovies[0];
    fireEvent.click(firstItem);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/videos', {
        state: { data: expect.anything(), trending: expect.anything() },
      });
    });
  });
});

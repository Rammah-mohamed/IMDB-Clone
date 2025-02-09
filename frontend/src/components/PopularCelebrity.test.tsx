import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { GET_POPULAR_CELEBRITY } from '../graphql/queries';
import PopularCelebrity from '../components/PopularCelebrity';

const mockCelebrities = [
  { id: 1, name: 'Celebrity 1', profile_path: '/path1.jpg' },
  { id: 2, name: 'Celebrity 2', profile_path: '/path2.jpg' },
  { id: 3, name: 'Celebrity 3', profile_path: '/path3.jpg' },
];

const mocks = [
  {
    request: {
      query: GET_POPULAR_CELEBRITY,
    },
    result: {
      data: {
        popularCelebrity: mockCelebrities,
      },
    },
  },
];

const mockNavigate = vi.fn();

describe('PopularCelebrity Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading state', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <MemoryRouter>
          <PopularCelebrity />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_POPULAR_CELEBRITY,
        },
        error: new Error('Failed to fetch'),
      },
    ];

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <MemoryRouter>
          <PopularCelebrity />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
  });

  it('renders popular celebrities', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <PopularCelebrity />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      mockCelebrities.forEach((celebrity) => {
        expect(screen.getByText(celebrity.name)).toBeInTheDocument();
      });
    });
  });

  it('navigates to celebrity details on click', async () => {
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <PopularCelebrity />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      const celebrityCard = screen.getByText(mockCelebrities[0].name);
      fireEvent.click(celebrityCard);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/celebrityDetails', {
      state: mockCelebrities[0],
    });
  });

  it('handles next and previous navigation', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <PopularCelebrity />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      const nextButton = screen.getByTestId('nextBtn');
      const prevButton = screen.getByTestId('prevBtn');

      fireEvent.click(nextButton);
      expect(screen.getByText(mockCelebrities[1].name)).toBeInTheDocument();

      fireEvent.click(prevButton);
      expect(screen.getByText(mockCelebrities[0].name)).toBeInTheDocument();
    });
  });
});

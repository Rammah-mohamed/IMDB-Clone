import { Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { AuthContext } from '../context/authContext';
import MediaDetail from '../components/MediaDetail';
import {
  GET_MEDIA,
  GET_GENRES,
  GET_SEASON_DETAILS,
  GET_TV_Details,
  SEARCH_CELEBRITY,
} from '../graphql/queries';

// Mocked components
vi.mock('react-player', () => ({
  default: () => <div>Mock ReactPlayer</div>,
}));

vi.mock('../components/Navbar', () => ({
  default: () => <div>Mock Navbar</div>,
}));

vi.mock('../components/MediaList', () => ({
  default: () => <div>MediaList</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

const mocks = [
  {
    request: {
      query: GET_MEDIA,
      variables: { id: 1 },
    },
    result: {
      data: {
        movieVideos: [{ key: 'abc123', name: 'Trailer', type: 'Trailer' }],
        moviesCast: [
          {
            id: 1,
            name: 'Actor 1',
            gender: 1,
            popularity: 10,
            known_for_department: 'Acting',
            profile_path: '/path.jpg',
            character: 'Hero',
            order: 0,
          },
        ],
        moviesCrew: [
          { id: 2, name: 'Director 1', job: 'Director', gender: 2, profile_path: '/path.jpg' },
        ],
        movieImages: [{ file_path: '/image.jpg', width: 1920, height: 1080 }],
        movieReview: [
          {
            author: 'Reviewer 1',
            author_details: { avatar_path: '/avatar.jpg', rating: 4.5 },
            content: 'Great movie!',
            created_at: '2021-01-01',
            updated_at: '2021-01-02',
            url: 'https://review.com',
          },
        ],
        tvVideos: [{ key: 'def456', name: 'TV Trailer', type: 'Teaser' }],
        tvCast: [
          {
            id: 3,
            name: 'TV Actor 1',
            gender: 1,
            popularity: 8,
            known_for_department: 'Acting',
            profile_path: '/tvpath.jpg',
            character: 'Lead',
            order: 1,
          },
        ],
        tvImages: [{ file_path: '/tvimage.jpg', width: 1280, height: 720 }],
        tvReview: [
          {
            author: 'TV Reviewer',
            author_details: { avatar_path: '/tvavatar.jpg', rating: 4.0 },
            content: 'Engaging show!',
            created_at: '2021-02-01',
            updated_at: '2021-02-02',
            url: 'https://tvreview.com',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_GENRES,
    },
    result: {
      data: {
        movieGenres: [
          { id: 28, name: 'Action' },
          { id: 35, name: 'Comedy' },
        ],
        tvGenres: [
          { id: 18, name: 'Drama' },
          { id: 10765, name: 'Sci-Fi & Fantasy' },
        ],
      },
    },
  },
  {
    request: {
      query: GET_SEASON_DETAILS,
      variables: { id: 1, number: 1 },
    },
    result: {
      data: {
        seasonDetail: {
          id: 1,
          name: 'Season 1',
          overview: 'First season overview',
          poster_path: '/season1.jpg',
          air_date: '2020-01-01',
          season_number: 1,
          episodes: [
            {
              id: 101,
              name: 'Episode 1',
              overview: 'Pilot episode',
              show_id: 1,
              still_path: '/ep1.jpg',
              vote_average: 8.5,
              vote_count: 100,
              runtime: 45,
              season_number: 1,
              episode_number: 1,
              air_date: '2020-01-01',
              crew: [],
              guest_stars: [],
            },
          ],
          vote_average: 8.0,
        },
      },
    },
  },
  {
    request: {
      query: GET_TV_Details,
      variables: { id: 1 },
    },
    result: {
      data: {
        tvDetail: {
          id: 1,
          name: 'TV Show',
          overview: 'TV show overview',
          poster_path: '/tvshow.jpg',
          backdrop_path: '/backdrop.jpg',
          first_air_date: '2019-01-01',
          last_air_date: '2021-01-01',
          episode_run_time: [45],
          number_of_episodes: 20,
          number_of_seasons: 2,
          popularity: 15.0,
          status: 'Ended',
          vote_average: 8.7,
          vote_count: 1500,
          genres: [{ id: 18, name: 'Drama' }],
          seasons: [
            {
              id: 1,
              name: 'Season 1',
              overview: 'Season 1 overview',
              poster_path: '/s1.jpg',
              air_date: '2019-01-01',
              season_number: 1,
              episode_count: 10,
              vote_average: 8.5,
            },
          ],
        },
      },
    },
  },
  {
    request: {
      query: SEARCH_CELEBRITY,
      variables: { query: 'John Doe', page: '1', lang: 'en' },
    },
    result: {
      data: {
        searchCelebrity: [
          {
            id: 1,
            name: 'John Doe',
            profile_path: '/johndoe.jpg',
            gender: 2,
            known_for_department: 'Acting',
            known_for: [
              {
                id: 101,
                title: 'Famous Movie',
                name: null,
                overview: 'Movie overview',
                poster_path: '/movie.jpg',
                backdrop_path: '/backdrop.jpg',
                release_date: '2020-01-01',
                first_air_date: null,
                genre_ids: [28, 35],
                media_type: 'movie',
                popularity: 10,
                vote_average: 8.2,
                vote_count: 200,
              },
            ],
            popularity: 20.0,
          },
        ],
      },
    },
  },
];

const mockLocation = {
  id: 1,
  title: 'Inception',
  description: 'A mind-bending thriller',
  posterUrl: 'https://image.tmdb.org/t/p/w500/inception.jpg',
  genre_ids: [28, 35],
  year: 2010,
  isAdded: false,
  media_type: 'movie',
};

const renderMediaDetail = () =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AuthContext.Provider value={{ user: 'test user', login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter initialEntries={[{ pathname: '/MediaDetail', state: mockLocation }]}>
          <Suspense fallback={<div>Loading...</div>}>
            <MediaDetail />
          </Suspense>
        </MemoryRouter>
      </AuthContext.Provider>
    </MockedProvider>
  );

describe('MediaComponent', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders media titles', async () => {
    renderMediaDetail();

    await waitFor(() => expect(screen.getByText('Inception')).toBeInTheDocument());
  });

  it('fetches and displays genres', async () => {
    renderMediaDetail();

    await waitFor(() => {
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Comedy')).toBeInTheDocument();
    });
  });

  it('navigates to media page when photo gets clicked', async () => {
    renderMediaDetail();

    await waitFor(() => {
      const photo = screen.getByTestId('photo');
      fireEvent.click(photo);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/media', expect.anything());
  });

  it('navigates to media page when video gets clicked', async () => {
    renderMediaDetail();

    await waitFor(() => {
      const video = screen.getByTestId('video');
      fireEvent.click(video);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/media', expect.anything());
  });

  it('navigates to critic page when critic button gets clicked', async () => {
    renderMediaDetail();

    await waitFor(() => {
      const critic = screen.getByTestId('critic');
      fireEvent.click(critic);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/critics', expect.anything());
  });

  it('displays loading state', async () => {
    renderMediaDetail();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_MEDIA,
          variables: { id: 1 },
        },
        result: {
          data: {
            movieVideos: [],
            moviesCast: [],
            moviesCrew: [],
            movieImages: [],
            movieReview: [],
            tvVideos: [],
            tvCast: [],
            tvImages: [],
            tvReview: [],
          },
        },
      },
      {
        request: {
          query: GET_GENRES,
        },
        result: {
          data: {
            movieGenres: [],
            tvGenres: [],
          },
        },
        error: new Error('Genres query failed'),
      },
      {
        request: {
          query: GET_SEASON_DETAILS,
          variables: { id: 1, number: 1 },
        },
        result: {
          data: {
            seasonDetail: {},
          },
        },
      },
      {
        request: {
          query: GET_TV_Details,
          variables: { id: 1 },
        },
        result: {
          data: {
            tvDetail: {},
          },
        },
      },
      {
        request: {
          query: SEARCH_CELEBRITY,
          variables: { query: 'John Doe', page: '1', lang: 'en' },
        },
        result: {
          data: {
            searchCelebrity: [],
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <AuthContext.Provider value={{ user: 'test user', login: vi.fn(), logout: vi.fn() }}>
          <MemoryRouter initialEntries={[{ pathname: '/MediaDetail', state: mockLocation }]}>
            <Suspense fallback={<div>Loading...</div>}>
              <MediaDetail />
            </Suspense>
          </MemoryRouter>
        </AuthContext.Provider>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Genres query failed/i)).toBeInTheDocument();
    });
  });
});

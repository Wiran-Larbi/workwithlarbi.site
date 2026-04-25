export interface GitHubData {
  totalContributions: number;
  weeks: { contributionDays: { contributionCount: number; date: string }[] }[];
  recentRepos: {
    name: string;
    description: string | null;
    pushedAt: string;
    url: string;
    primaryLanguage: { name: string } | null;
  }[];
}

const EMPTY: GitHubData = { totalContributions: 0, weeks: [], recentRepos: [] };

const QUERY = `
  query GitHubActivity($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
      repositories(
        first: 7
        orderBy: { field: PUSHED_AT, direction: DESC }
        ownerAffiliations: [OWNER]
        privacy: PUBLIC
      ) {
        nodes {
          name
          description
          pushedAt
          url
          primaryLanguage {
            name
          }
        }
      }
    }
  }
`;

export async function fetchGitHubActivity(): Promise<GitHubData> {
  const token = import.meta.env.GITHUB_TOKEN;
  if (!token) return EMPTY;

  try {
    const to = new Date();
    const from = new Date(to);
    from.setUTCFullYear(from.getUTCFullYear() - 1);

    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          login: 'heyderekj',
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
    });

    if (!res.ok) return EMPTY;

    const json = (await res.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions?: number;
              weeks?: GitHubData['weeks'];
            };
          };
          repositories?: { nodes?: GitHubData['recentRepos'] };
        };
      };
      errors?: unknown;
    };

    if (json.errors?.length) return EMPTY;

    const user = json.data?.user;
    if (!user) return EMPTY;

    const cal = user.contributionsCollection?.contributionCalendar;
    const total = cal?.totalContributions ?? 0;
    const weeks = cal?.weeks ?? [];
    const recentRepos = user.repositories?.nodes ?? [];

    return {
      totalContributions: total,
      weeks,
      recentRepos,
    };
  } catch {
    return EMPTY;
  }
}

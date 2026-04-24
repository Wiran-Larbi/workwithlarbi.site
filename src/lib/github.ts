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
  query GitHubActivity($login: String!) {
    user(login: $login) {
      contributionsCollection {
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
        first: 6
        orderBy: { field: PUSHED_AT, direction: DESC }
        ownerAffiliations: [OWNER]
        privacy: PUBLIC
      ) {
        nodes {
          name
          description
          pushedAt
          url
          primaryLanguage { name }
        }
      }
    }
  }
`;

export async function fetchGitHubActivity(): Promise<GitHubData> {
  const token = import.meta.env.GITHUB_TOKEN;
  if (!token) return EMPTY;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY, variables: { login: 'heyderekj' } }),
    });

    if (!res.ok) return EMPTY;

    const json = await res.json();
    const user = json?.data?.user;
    if (!user) return EMPTY;

    return {
      totalContributions:
        user.contributionsCollection.contributionCalendar.totalContributions,
      weeks: user.contributionsCollection.contributionCalendar.weeks,
      recentRepos: user.repositories.nodes,
    };
  } catch {
    return EMPTY;
  }
}

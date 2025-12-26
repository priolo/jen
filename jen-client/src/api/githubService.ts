import { GitHubRepository, GitHubSearchResponse, GitHubUser } from '@/types/GitHub';



class GitHubApiService {
    private baseUrl = 'https://api.github.com';

    /**
     * Search for repositories on GitHub
     * @param query - Search query (repository name, description, etc.)
     * @param per_page - Number of results per page (default: 10, max: 100)
     * @param page - Page number (default: 1)
     */
    async searchRepositories(query: string, per_page = 10, page = 1): Promise<GitHubSearchResponse> {
        const searchParams = new URLSearchParams({
            q: query,
            per_page: per_page.toString(),
            page: page.toString(),
            sort: 'stars',
            order: 'desc'
        });

        const response = await fetch(`${this.baseUrl}/search/repositories?${searchParams}`);

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Search for users on GitHub
     * @param query - Search query (username, email, full name, etc.)
     * @param per_page - Number of results per page (default: 10, max: 100)
     * @param page - Page number (default: 1)
     */
    async searchUsers(query: string, per_page = 10, page = 1): Promise<GitHubUser[]> {
        const searchParams = new URLSearchParams({
            q: query,
            per_page: per_page.toString(),
            page: page.toString(),
            sort: 'followers',
            order: 'desc'
        });

        const response = await fetch(`${this.baseUrl}/search/users?${searchParams}`);
        if (!response.ok) throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        const data = await response.json();
        return data.items as GitHubUser[];
    }

    

    /**
    * restituisce il repository sia che venga passato come "owner/repo" o come ID numerico
    * mi nelle FEATURE
    * @param id - Repository full name (owner/repo) or numeric ID
    */
    async getRepository(id: string | number): Promise<GitHubRepository> {
        let response:Response
        if (typeof id === 'number') {
            response = await fetch(`${this.baseUrl}/repositories/${id}`);
        } else {
            response = await fetch(`${this.baseUrl}/repos/${id}`);
        }
        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }



    /**
     * Get GitHub account data by ID
     * serve in ACCOUNT PAGE
     * @param accountId - GitHub user account ID (numeric)
     */
    async getUserById(accountId: number): Promise<GitHubUser> {
        const response = await fetch(`${this.baseUrl}/user/${accountId}`);
        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }



    async getContributors(owner:string, repo:string): Promise<GitHubUser[]> {
        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contributors`);
        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

   
}

const gitHubApi = new GitHubApiService();
export default gitHubApi;



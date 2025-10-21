declare module '../apps/songs/services/SpotifyService' {
  export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
  }
  
  export interface SpotifyAlbumArtResult {
    albumArtUrl: string | null;
    artistImageUrl: string | null;
  }
  
  class SpotifyService {
    searchAlbumArt(artist: string, album?: string | null): Promise<SpotifyAlbumArtResult>;
  }
  
  const service: SpotifyService;
  export default service;
}
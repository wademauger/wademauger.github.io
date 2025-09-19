declare module '../apps/songs/services/SpotifyService' {
  class SpotifyService {
    searchAlbumArt(artist: string, album?: string | null): Promise<any>;
  }
  
  const service: SpotifyService;
  export default service;
}
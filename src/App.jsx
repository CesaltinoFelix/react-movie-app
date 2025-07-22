import { useState, useEffect } from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import Pagination from './components/Pagination'
import { updateSearchCount, getTrendingMovie } from './appwrite'
import './App.css'

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = ()=>{
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoanding] = useState(false)
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('')
  const [trendingMovies, setTrendingMovies] = useState([])
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)


  useDebounce(()=>setDebounceSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '', page = 1)=>{
    setIsLoanding(true)
    setErrorMessage('')
    try {
      const endpoint =  query ?  `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc&language=en&page=${page}`;
      
      const response = await fetch(endpoint, API_OPTIONS)
      
      if(!response.ok)
        throw new Error("Failed to fetch movies")

      const data = await response.json()

      if(data.Response == 'false')
      {
        setErrorMessage(data.Error || "Failed to fetch movies")
        setMovieList([])
        return;
      }

      setMovieList(data.results || [])
      setCurrentPage(data.page || 1)
      setTotalPages(Math.min(data.total_pages || 1, 500)) // TMDB limita a 500 páginas
      setTotalResults(data.total_results || 0)
      
      if(query && data.results.length > 0)
        await updateSearchCount(query, data.results[0])
    } catch (error) {
      console.log(`Error fetching movie: ${error}`)
      setErrorMessage('Error fetching movie, Ploase try again later')
    }finally{
      setIsLoanding(false) 
    }
  }

  const loadTrendingMovies = async()=>{
    try {
        const movies = await getTrendingMovie()
        
        setTrendingMovies(movies || [])
    } catch (error) {
      console.log(`Error fetching trending movie: ${error}`)
      // Falha silenciosa - não quebra a aplicação
      setTrendingMovies([])
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchMovies(debounceSearchTerm, page)
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(()=>{
   setCurrentPage(1) // Resetar para página 1 quando busca mudar
   fetchMovies(debounceSearchTerm, 1)
  }, [debounceSearchTerm])

  useEffect(()=>{
    loadTrendingMovies()
  }, [])
  return (
    <main>
      <div className='pattern'/>
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without The Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>
        {trendingMovies.length > 0 && (
          <div className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {
                trendingMovies.map((movie, index)=> (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))
              }
            </ul>
          </div>
        )}
        <section className='all-movies'>
          <h2>All Movies</h2>
          {totalResults > 0 && !isLoading && (
            <p className='text-light-200 text-sm mb-4'>
              {searchTerm ? `Found ${totalResults.toLocaleString()} results for "${searchTerm}"` : `${totalResults.toLocaleString()} popular movies`}
            </p>
          )}
          {isLoading ? <Spinner/> : 
          errorMessage ? (<p className='text-red-500'>{errorMessage}</p>) 
          : (
            <>
              <ul>
                {
                  movieList.map((movie)=>(
                    <MovieCard key={movie.id} movie={movie}/>
                  ))
                }
              </ul>
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default App

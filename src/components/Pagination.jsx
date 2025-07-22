const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Ajustar se não temos páginas suficientes no final
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {/* Botão Primeira Página */}
      {currentPage > 1 && (
        <button 
          onClick={() => onPageChange(1)}
          className="pagination-btn"
          disabled={currentPage === 1}
        >
          ««
        </button>
      )}
      
      {/* Botão Página Anterior */}
      {currentPage > 1 && (
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          className="pagination-btn"
          disabled={currentPage === 1}
        >
          ‹
        </button>
      )}
      
      {/* Números das páginas */}
      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
        >
          {page}
        </button>
      ))}
      
      {/* Botão Próxima Página */}
      {currentPage < totalPages && (
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          className="pagination-btn"
          disabled={currentPage === totalPages}
        >
          ›
        </button>
      )}
      
      {/* Botão Última Página */}
      {currentPage < totalPages && (
        <button 
          onClick={() => onPageChange(totalPages)}
          className="pagination-btn"
          disabled={currentPage === totalPages}
        >
          »»
        </button>
      )}
      
      {/* Informações da página */}
      <span className="pagination-info">
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
};

export default Pagination;

const popularSearches = ['Product Designer', 'React', 'Data Analyst'];

function SearchBar() {
  return (
    <div className="search-area">
      <div className="search-bar">
        <label>
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input aria-label="Poste ou compétence" placeholder="Poste, compétence..." />
        </label>
        <span className="search-divider" />
        <label className="location">
          <span aria-hidden="true">⌖</span>
          <input aria-label="Localisation" placeholder="Où ?" />
        </label>
        <button className="search-button" type="button">
          <span aria-hidden="true">⌕</span> Rechercher
        </button>
      </div>
      <div className="popular">
        <span>Populaire</span>
        {popularSearches.map((item) => (
          <button type="button" key={item}>{item} <b>→</b></button>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;

const SearchBox = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="input-group shadow-sm rounded-pill overflow-hidden border">
    <span className="input-group-text bg-white border-0">
      <i className="bi bi-search"></i>
    </span>
    <input
      type="text"
      className="form-control border-0"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default SearchBox;

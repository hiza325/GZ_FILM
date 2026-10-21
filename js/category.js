async function loadCategory(type){

  const data =
  await fetchCategory(type);

  renderMovies(data.data.items);

}
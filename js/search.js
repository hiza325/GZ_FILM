const searchInput =
document.getElementById("searchInput");

searchInput.addEventListener("keyup", async () => {

  const keyword =
  searchInput.value;

  if(keyword.length <= 1){

    loadLatestMovies();

    return;
  }

  const data =
  await fetchSearch(keyword);

  renderMovies(data.data.items);

});
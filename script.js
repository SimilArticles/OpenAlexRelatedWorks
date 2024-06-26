const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('results');

searchButton.addEventListener('click', async () => {
  const doi = document.getElementById('doiInput').value;

  try {
    // 1. Fetch Related Works from OpenAlex
    const relatedWorks = await getRelatedWorks(doi);

    // 2. Get Concepts for Related Works from OpenAlex AI
    const relatedWorksWithConcepts = await Promise.all(
      relatedWorks.map(async (work) => {
        const concepts = await getConceptsForWork(work.id);
        return { ...work, concepts };
      })
    );

    // 3. Display Results
    displayResults(relatedWorksWithConcepts);
  } catch (error) {
    console.error("Error fetching data:", error);
    resultsContainer.innerHTML = "<p>An error occurred. Please try again later.</p>";
  }
});

async function getRelatedWorks(doi) {
  const response = await fetch(`https://api.openalex.org/works/doi:${doi}/related`);
  const data = await response.json();
  return data.results; 
}

async function getConceptsForWork(workId) {
  const response = await fetch(`https://api.openalex.org/works/${workId}/concepts`);
  const data = await response.json();
  return data.results.map((concept) => concept.display_name);
}

function displayResults(relatedWorks) {
  resultsContainer.innerHTML = ''; // Clear previous results

  if (relatedWorks.length === 0) {
    resultsContainer.innerHTML = "<p>No related works found.</p>";
    return;
  }

  const resultList = document.createElement('ul');
  relatedWorks.forEach((work) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <a href="${work.doi}" target="_blank">${work.title}</a> 
      <br>
      Concepts: ${work.concepts.join(', ')}
    `;
    resultList.appendChild(listItem);
  });

  resultsContainer.appendChild(resultList);
}

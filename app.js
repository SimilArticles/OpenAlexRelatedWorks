async function queryOpenAlex() {
    const doi = document.getElementById('doiInput').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Loading...';

    try {
        // Step 2: Query OpenAlex API with the DOI
        const response = await fetch(`https://api.openalex.org/works?filter=doi:${doi}`);
        const data = await response.json();

        if (data.results.length === 0) {
            resultsDiv.innerHTML = 'No results found for this DOI.';
            return;
        }

        // Step 3: Parse the response to get related works
        const relatedWorks = data.results[0].related_works;

        // Step 4 & 5: Query OpenAlex for each related work and display results
        const relatedWorksPromises = relatedWorks.map(async (workId) => {
            const workResponse = await fetch(`https://api.openalex.org/works/${workId}`);
            const workData = await workResponse.json();
            return `
                <div class="related-work">
                    <a href="https://doi.org/${workData.doi}" target="_blank">${workData.title}</a>
                </div>
            `;
        });

        const relatedWorksHtml = await Promise.all(relatedWorksPromises);
        resultsDiv.innerHTML = '<h2>Related Works:</h2>' + relatedWorksHtml.join('');

    } catch (error) {
        resultsDiv.innerHTML = `An error occurred: ${error.message}`;
    }
}

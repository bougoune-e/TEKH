import asyncio
from crawl4ai import AsyncWebCrawler

async def main():
    async with AsyncWebCrawler() as crawler:
        # On teste sur la liste des marques
        result = await crawler.arun(url="https://www.gsmarena.com/makers.php3")
        if result.success:
            print("Succès ! Voici un extrait du contenu :")
            print(result.markdown[:500]) # Affiche les 500 premiers caractères
        else:
            print(f"Échec : {result.error_message}")

if __name__ == "__main__":
    asyncio.run(main())

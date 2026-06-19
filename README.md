# 🏃‍♂️ AI Run & Diet Coach (n8n Automation)

Zautomatyzowany system do generowania spersonalizowanych, długoterminowych planów treningowych i dietetycznych dla biegaczy, oparty na architekturze RAG (Retrieval-Augmented Generation) w środowisku n8n.

---

## ⚙️ Jak to działa (Architektura)

Projekt eliminuje potrzebę ręcznego przeliczania objętości treningowej i zapotrzebowania kalorycznego. Cały przepływ jest w pełni zautomatyzowany:

1. **Wyzwalacz (Trigger):** Biegacz wypełnia ankietę w Google Forms (waga, wiek, staż, dostępność, cel). Nowy wiersz wpada do Google Sheets.
2. **Pobranie Bazy Wiedzy:** Węzeł n8n natychmiast łączy się z Google Drive i pobiera podręcznik PDF (metodyka treningowa + fundamenty dietetyczne).
3. **Analiza AI (RAG):** Model Google Gemini 1.5 Flash analizuje ankietę oraz PDF. Wylicza BMR, rozkład makroskładników, programuje tygodniowy kilometraż z bezpieczną progresją (max 10% co tydzień) i uwzględnia fazę taperingu.
4. **Czyszczenie Danych (JS):** Skrypt JavaScript "wyłapuje" i czyści surową odpowiedź modelu AI do czystej postaci JSON (Array of Objects).
5. **Zapis do Arkusza:** n8n automatycznie tworzy nową zakładkę w docelowym Google Sheets i wkleja gotowy, np. 98-dniowy plan dzień po dniu.

---

## 🚀 Instrukcja uruchomienia (Krok po kroku)

## Opcja 1: Chcę otrzymać plan treningowy (Dla biegaczy)
Jeśli jesteś zawodnikiem i chcesz uzyskać spersonalizowany plan:

1. **Wypełnij formularz:** Wejdź w link ankiety: https://forms.gle/h9oLonjznG64Xbu9A i wypełnij wszystkie dane (wiek, waga, cel, kontuzje).
2. **Poczekaj na generowanie:** Po kliknięciu "Wyślij", nasz system AI potrzebuje około 4–5 minut na przeanalizowanie Twoich parametrów, wyliczenie bezpiecznego progresu i ułożenie diety.
3. **Sprawdź wynik:** Po tym czasie wejdź w link do udostępnionego arkusza: https://docs.google.com/spreadsheets/d/1Qe3aDbtyM3xs0m7HYIvedRMo0p7ZSRBxZvWokdhfKZw/edit?usp=sharing. W nowej zakładce znajdziesz swój kompletny plan treningowy i dietetyczny na cały wybrany okres.

## Opcja 2: Chcę zbudować własny system (Dla programistów/automatyków)

### 1. Wymagania wstępne
* Zainstalowane środowisko **n8n** (lokalnie przez Docker/npm lub darmowe konto n8n Cloud).
* Konto **Google** (do obsługi Forms, Sheets i Drive).
* Wygenerowany, darmowy klucz API do **Google Gemini** (Google AI Studio).

### 2. Import projektu do n8n
1. Pobierz plik `AI_Run_Coach.json` z tego repozytorium.
2. Otwórz swój panel n8n i utwórz nowy Workflow.
3. W prawym górnym rogu kliknij ikonę trzech kropek `...` -> **Import from File**.
4. Wybierz pobrany plik JSON. Mapa węzłów pojawi się na Twoim ekranie.

### 3. Konfiguracja połączeń (Credentials)
Musisz uwierzytelnić węzły swoimi danymi, aby n8n miało dostęp do Twoich plików:
* **Google Sheets Trigger:** Podepnij swoje konto Google i wskaż plik arkusza, do którego wpadają odpowiedzi z Twojej ankiety.
* **Google Drive (Download file):** Podepnij konto Google i wklej ID pliku PDF ze swoją bazą wiedzy (ID znajdziesz w linku udostępniania pliku na Dysku Google).
* **Google Gemini Chat Model:** Utwórz nowe poświadczenie (Credential) i wklej swój klucz API z Google AI Studio. Upewnij się, że wybrany model to `gemini-2.5-flash`.
* **Google Sheets (Append Row):** Wskaż docelowy arkusz kalkulacyjny, w którym n8n ma tworzyć nowe plany.

### 4. Uruchomienie
Gdy wszystkie węzły świecą się na zielono po kliknięciu "Execute Step", przełącz suwak w prawym górnym rogu z **Inactive** na **Active**. Od tego momentu system działa automatycznie w tle.

---

## 📖 Dokumentacja Projektu (Złożenia i Refleksja)

### 1. Problem
Tworzenie spersonalizowanych planów treningowo-dietetycznych to czysta, powtarzalna matematyka, która pożera mnóstwo czasu. Ułożenie profesjonalnego planu na np. 14 tygodni oznacza konieczność wygenerowania i zaplanowania dokładnie 98 dni treningowych. Ręczne wyliczenie bezpiecznego progresu objętości kilometrowej (o 10-15% z tygodnia na tydzień), a następnie dopasowanie do tego zapotrzebowania kalorycznego dla każdego z tych 98 dni zajmuje trenerowi średnio 2 do 3 godzin pracy.
Przy zaledwie 10 podopiecznych daje to nawet 20-30 godzin samej "papierologii". Gotowe plany z internetu nie rozwiązują problemu, bo nie uwzględniają zmiennych (kontuzje, dokładna waga, dyspozycyjność w tygodniu). Projekt rozwiązuje ten problem, redukując czas tworzenia idealnie matematycznie wyliczonego planu z kilku godzin do zaledwie **4–5 minut** automatycznej pracy systemu w tle.

### 2. Narzędzia
System został zbudowany z naciskiem na minimalizację kosztów i maksymalną elastyczność:
* **Google Forms / Google Sheets:** Jako darmowy interfejs oraz baza danych. Posiadają natywne wsparcie dla wyzwalaczy w n8n.
* **Google Drive:** Służy jako prosty hosting dla bazy wiedzy (podręcznika PDF). Zmiana metodyki wymaga jedynie podmiany pliku na Dysku.
* **n8n:** Wizualne środowisko automatyzacji (node-based), które pozwala na wstrzykiwanie własnego kodu w JavaScript tam, gdzie gotowe integracje nie wystarczają.
* **Google Gemini 2.5 Flash (LLM):** Model stworzony do przetwarzania dużego okna kontekstowego (RAG na plikach PDF), darmowy w podstawowym użyciu i odporniejszy na błędy przeciążenia niż wersje *preview*.
* **JavaScript (Custom Code):** Wykorzystany do napisania bloku `try...catch` i funkcji parsowania surowej odpowiedzi LLM, uodparniając system na tzw. halucynacje formatowania.

### 3. Refleksja i Wyzwania
Budowa systemu ujawniła ograniczenia Dużych Modeli Językowych w środowisku wymagającym ścisłej logiki matematycznej. 
* AI początkowo gubiło kalendarz i dodawało kilometry w sposób chaotyczny. Rozwiązaniem okazał się rygorystyczny **Prompt Engineering** (wymuszenie myślenia systemem bloków 7-dniowych, wprowadzenie górnego limitu 35 km na jeden trening oraz twardych równań BMR).
* Drugim wyzwaniem była stabilność API. Przy dużych obciążeniach (generowanie JSON-a z 98 obiektami i czytanie kilkudziesięciu stron PDF) serwery odrzucały zapytania (błąd 503). Wdrożenie mechanizmu **Retry On Fail** (automatyczne ponawianie przy błędzie) ustabilizowało przepływ, dowodząc, że w automatyzacjach sam przepływ (happy path) to zaledwie początek sukcesu – kluczem jest odpowiednia obsługa błędów.

---

# 🏃‍♂️ AI Run & Diet Coach (n8n Automation)
An automated system for generating personalized, long-term training and diet plans for runners, based on RAG (Retrieval-Augmented Generation) architecture within the n8n environment.

## ⚙️ How it Works (Architecture)
This project eliminates the need for manual calculations of training volume and caloric requirements. The entire workflow is fully automated:

1. **Trigger:** A runner fills out a Google Form (weight, age, experience, availability, goal). New data enters Google Sheets.
2. **Knowledge Base Retrieval:** The n8n node immediately connects to Google Drive and retrieves a PDF manual (training methodology + dietary foundations).
3. **AI Analysis (RAG):** The Google Gemini 1.5 Flash model analyzes the survey and the PDF. It calculates BMR, macronutrient distribution, programs weekly mileage with safe progression (max 10% per week), and accounts for tapering phases.
4. **Data Sanitization (JS):** A JavaScript snippet catches and cleans the raw AI response into a clean JSON format (Array of Objects).
5. **Sheet Update:** n8n automatically creates a new tab in the target Google Sheet and pastes the complete, e.g., 98-day plan, day by day.

## 🚀 Setup Guide (Step-by-Step)
## Option 1: I want a training plan (For runners)
If you are an athlete and want to receive a personalized plan:

1. **Fill out the form:** Access the survey link: https://forms.gle/h9oLonjznG64Xbu9A and provide your data (age, weight, goal, injuries).
2. **Wait for generation:** After clicking "Submit," our AI system needs about 4–5 minutes to analyze your parameters, calculate safe progression, and structure your diet.
3. **Check the result:** After that time, check the shared spreadsheet link: https://docs.google.com/spreadsheets/d/1Qe3aDbtyM3xs0m7HYIvedRMo0p7ZSRBxZvWokdhfKZw/edit?usp=sharing. In a new tab, you will find your complete training and diet plan for the selected period.

## Option 2: I want to build my own system (For developers/automators)
### 1. Prerequisites
*Installed **n8n** environment (locally via Docker/npm or a free n8n Cloud account).
*Google Account (to handle Forms, Sheets, and Drive).
*Generated, free API key for Google Gemini (via Google AI Studio).

### 2. Import project into n8n
1. Download the `AI_Run_Coach.json` file from this repository.
2. Open your n8n panel and create a new Workflow.
3. In the top right corner, click the three dots icon `...` -> **Import from File**.
4. Select the downloaded JSON file. The node map will appear on your screen.

3. Connection Configuration (Credentials)
You must authenticate the nodes with your data so n8n can access your files:

* **Google Sheets Trigger:** Connect your Google account and point to the spreadsheet file where survey responses are collected.
* **Google Drive (Download file):** Connect your Google account and paste the File ID of your PDF knowledge base (the ID can be found in the file's sharing link).
* **Google Gemini Chat Model:** Create new credentials and paste your API key from Google AI Studio. Ensure the model is set to gemini-1.5-flash.
* **Google Sheets (Append Row):** Point to the target spreadsheet where n8n should create new plans.

4. Activation
Once all nodes glow green after clicking "Execute Step," switch the toggle in the top right from Inactive to Active. From this moment on, the system runs automatically in the background.

---

## 📖 Project Documentation (Assumptions & Reflection)
##1. Problem
Creating personalized training and diet plans is pure, repetitive math that consumes a lot of time. Designing a professional 14-week plan requires generating and scheduling exactly 98 training days. Manually calculating safe mileage progression (10-15% week-over-week) and adjusting caloric needs for each of those 98 days takes a coach an average of 2-3 hours.
With only 10 clients, this adds up to 20-30 hours of "paperwork." Pre-made plans from the internet don't solve the problem because they lack variables (injuries, exact weight, weekly availability). This project solves this, reducing the time for creating a mathematically perfect plan from several hours to just **4–5 minutes** of automated background work.

## 2. Tools
The system was built with a focus on cost minimization and maximum flexibility:

* **Google Forms / Google Sheets:** As a free interface and database. They have native support for triggers in n8n.
* **Google Drive:** Serves as a simple hosting solution for the knowledge base (PDF manual). Changing the methodology only requires updating the file on Google Drive.
* **n8n:** A visual automation environment (node-based) that allows for custom JavaScript injection where ready-made integrations fall short.
* **Google Gemini 2.5 Flash (LLM):** A model designed for processing large context windows (RAG on PDFs), free for basic use, and more resilient to overload errors than preview versions.
* **JavaScript (Custom Code):** Used to write `try...catch` blocks and parsing functions for the raw LLM response, making the system immune to "formatting hallucinations."

## 3. Reflection and Challenges
Building the system revealed the limitations of Large Language Models in environments requiring strict mathematical logic.
* Prompt Engineering: The AI initially lost track of the calendar and added mileage chaotically. The solution was rigorous Prompt Engineering (forcing the model to think in 7-day blocks, setting a 35 km per workout limit, and hard-coding BMR equations).
* API Stability: The second challenge was API stability. Under high loads (generating JSON with 98 objects and reading dozens of PDF pages), servers rejected requests (503 error). Implementing a Retry On Fail mechanism stabilized the flow, proving that in automation, the "happy path" is just the beginning—handling errors is the key to success.

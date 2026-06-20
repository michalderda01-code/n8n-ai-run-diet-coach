# 🏃‍♂️ AI Run & Diet Coach (n8n Automation)

Zautomatyzowane narzędzie **dla trenerów biegowych**, służące do błyskawicznego generowania spersonalizowanych, długoterminowych planów treningowych i dietetycznych dla podopiecznych. System oparty jest na architekturze RAG (Retrieval-Augmented Generation) w środowisku n8n.

Dzięki temu rozwiązaniu trener nie musi spędzać godzin na żmudnych obliczeniach objętości treningowej i zapotrzebowania kalorycznego w arkuszach kalkulacyjnych. Wygenerowanie kompletnego, bezpiecznego planu dla jednego zawodnika zajmuje teraz **około 5 minut**, automatycznie działając w tle.

---

## ⚙️ Jak to działa (Architektura)

Cały przepływ jest w pełni zautomatyzowany i zintegrowany z narzędziami Google:

1. **Wyzwalacz (Trigger):** Podopieczny wypełnia ankietę w Google Forms (waga, wiek, staż, dostępność, cel, kontuzje). Nowy wiersz trafia do Google Sheets.
2. **Pobranie Bazy Wiedzy:** Węzeł n8n natychmiast łączy się z Google Drive i pobiera podręcznik PDF (wiedza trenera: metodyka treningowa + fundamenty dietetyczne).
3. **Analiza AI (RAG):** Model Google Gemini 2.5 Flash analizuje ankietę oraz PDF. Wylicza BMR, rozkład makroskładników, programuje tygodniowy kilometraż z bezpieczną progresją (max 10% co tydzień) i układa strukturę makrocyklu.
4. **Czyszczenie Danych (JS):** Skrypt JavaScript "wyłapuje" i czyści surową odpowiedź modelu AI do czystej postaci JSON (Array of Objects).
5. **Zapis do Arkusza:** n8n automatycznie tworzy nową zakładkę w docelowym Google Sheets i wkleja gotowy plan na każdy dzień.

---

## 🛠️ Dokumentacja Utrzymaniowa (Maintenance)

### 1. Jak dodać nowy dokument / dane do systemu
Aby zaktualizować bazę wiedzy (np. nowa metodyka treningowa, inne wytyczne dietetyczne):
* **Opcja A (Zalecana):** Nadpisz istniejący plik PDF na swoim dysku Google Drive (użyj opcji "Zarządzaj wersjami" i wgraj nowy plik). Dzięki temu ID pliku pozostanie bez zmian i system będzie działał płynnie.
* **Opcja B:** Wgraj nowy plik na Google Drive, skopiuj jego nowe "File ID" z linku udostępniania i wklej je w węźle `Google Drive (Download file)` w panelu n8n.

### 2. Jak zmienić konfigurację (prompt, model, źródła)
Wszelkie modyfikacje logiki odbywają się bezpośrednio w środowisku n8n:
* **Zmiana Promptu (Instrukcji dla AI):** Otwórz węzeł `Google Gemini Chat Model`. Przejdź do pola `System Message` lub `Message`, aby zmodyfikować zasady wyliczania planu, limity kilometrażu czy język odpowiedzi.
* **Zmiana Modelu:** W tym samym węźle `Google Gemini`, w sekcji "Model", możesz z listy rozwijanej wybrać inną wersję (obecnie zoptymalizowane pod `gemini-2.5-flash`, co gwarantuje najlepszy stosunek szybkości do jakości; w razie potrzeby głębszej analizy można testować wyższe modele z rodziny Gemini).
* **Zmiana Źródeł:** Aby zmienić arkusze wejściowe/wyjściowe, wejdź w odpowiednie węzły `Google Sheets` i wskaż nowe pliki z Twojego połączonego dysku Google.

### 3. Co robić, gdy coś nie działa (troubleshooting)
* **Problem: Nowe ankiety nie uruchamiają automatyzacji.**
  * *Rozwiązanie:* Sprawdź węzeł `Google Sheets Trigger`. Upewnij się, że autoryzacja (Credential) Google nie wygasła. W razie potrzeby zaloguj się ponownie (Re-authenticate).
* **Problem: Błąd parsowania w węźle JavaScript (JSON error).**
  * *Rozwiązanie:* Model AI wygenerował odpowiedź w złym formacie (tzw. halucynacja formatowania). Upewnij się, że włączona jest opcja "Retry On Fail" w ustawieniach węzła Gemini. Sprawdź w logach, czy prompt nie jest zbyt restrykcyjny.
* **Problem: Błąd API 503 (Overload / Rate Limit).**
  * *Rozwiązanie:* Serwery Google Gemini odrzuciły zapytanie z powodu zbyt dużego obciążenia na darmowym kluczu. System powinien ponowić próbę automatycznie, jeśli włączono mechanizm Retry. Przy skalowaniu rozważ przejście na płatny pakiet (Pay-as-you-go).

### 4. Kto jest właścicielem systemu, jak go skontaktować
* **Właściciel Systemu:** Michał Derda
* **Kontakt (Support):** michal.derda11@interia.pl
* W przypadku awarii krytycznych lub chęci wdrożenia nowych funkcji (np. integracji z systemami zewnętrznymi), proszę o bezpośredni kontakt powyższymi kanałami.

### 5. Ograniczenia i znane problemy
* **Halucynacje matematyczne LLM:** Modele językowe nie są kalkulatorami. Mimo rygorystycznych promptów i wydajności modelu Gemini 2.5 Flash, przy bardzo długich planach AI może sporadycznie pomylić się w sumowaniu tygodniowego kilometrażu. Wymaga to okresowej, szybkiej weryfikacji wygenerowanego arkusza przez trenera.
* **Brak zaawansowanych wyliczeń tempa:** Obecna wersja operuje głównie na objętości (kilometraż i czas). Precyzyjne treningi w zadanym tempie (np. wyliczanie tempa progowego czy interwałów na podstawie życiówek) są dopiero planowane w przyszłych aktualizacjach.

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

An automated tool **for running coaches**, designed to instantly generate personalized, long-term training and diet plans for their athletes. The system is based on RAG (Retrieval-Augmented Generation) architecture within the n8n environment.

Thanks to this solution, coaches no longer have to spend hours on tedious calculations of training volume and caloric requirements in spreadsheets. Generating a complete, safe plan for one athlete now takes **about 5 minutes**, working automatically in the background.

---

## ⚙️ How it Works (Architecture)

The entire workflow is fully automated and integrated with Google Workspace:

1. **Trigger:** The athlete fills out a Google Form (weight, age, experience, availability, goal, injuries). A new row enters Google Sheets.
2. **Knowledge Base Retrieval:** The n8n node immediately connects to Google Drive and retrieves a PDF manual (coach's knowledge: training methodology + dietary foundations).
3. **AI Analysis (RAG):** The Google Gemini 2.5 Flash model analyzes the survey and the PDF. It calculates BMR, macronutrient distribution, programs weekly mileage with safe progression (max 10% per week), and structures the macrocycle.
4. **Data Sanitization (JS):** A JavaScript snippet catches and cleans the raw AI response into a clean JSON format (Array of Objects).
5. **Sheet Update:** n8n automatically creates a new tab in the target Google Sheet and pastes the ready plan, day by day.

---

## 🛠️ Maintenance Documentation

In accordance with best practices for maintaining automation systems, below are the instructions for managing the project:

### 1. How to add a new document / data to the system
To update the knowledge base (e.g., new training methodology, updated dietary guidelines):
* **Option A (Recommended):** Overwrite the existing PDF file on your Google Drive (use the "Manage versions" option and upload the new file). This keeps the File ID unchanged, ensuring the system runs smoothly without further edits.
* **Option B:** Upload a new file to Google Drive, copy its new "File ID" from the sharing link, and paste it into the `Google Drive (Download file)` node in the n8n panel.

### 2. How to change the configuration (prompt, model, sources)
All logic modifications take place directly within the n8n environment:
* **Changing the Prompt (AI Instructions):** Open the `Google Gemini Chat Model` node. Go to the `System Message` or `Message` field to modify plan calculation rules, mileage limits, or response language.
* **Changing the Model:** In the same `Google Gemini` node, under the "Model" section, you can select a different version from the dropdown (currently optimized for `gemini-2.5-flash`, which guarantees the best speed-to-quality ratio; if deeper analysis is needed, higher-tier Gemini models can be tested).
* **Changing Sources:** To change the input/output sheets, go into the respective `Google Sheets` nodes and select the new files from your connected Google Drive.

### 3. Troubleshooting (What to do when something breaks)
* **Problem: New surveys do not trigger the automation.**
  * *Solution:* Check the `Google Sheets Trigger` node. Ensure your Google Credential hasn't expired. Re-authenticate if necessary.
* **Problem: Parsing error in the JavaScript node (JSON error).**
  * *Solution:* The AI model generated a response in the wrong format (formatting hallucination). Ensure the "Retry On Fail" option is enabled in the Gemini node settings. Check the execution logs to see if the prompt is too restrictive.
* **Problem: API 503 Error (Overload / Rate Limit).**
  * *Solution:* Google Gemini servers rejected the request due to high load on a free API key. The system should automatically retry if the Retry mechanism is enabled. If scaling up, consider switching to a Pay-as-you-go plan.

### 4. System Owner & Contact
* **System Owner / Main Architect:** Michał Derda
* **Support Contact:** michal.derda11@interia.pl
* In the event of critical failures or a desire to implement new features (e.g., external system integrations), please contact me directly via the channels above.

### 5. Limitations and Known Issues
* **LLM Math Hallucinations:** Language models are not calculators. Despite rigorous prompts and the efficiency of the Gemini 2.5 Flash model, for very long plans, the AI might occasionally make a mistake when summing up weekly mileage. This requires periodic, quick verification of the generated spreadsheet by the coach.
* **Lack of Advanced Pace Calculations:** The current version operates mainly on volume (mileage and time). Precise target-pace workouts (e.g., calculating threshold paces or intervals based on personal bests) are planned for future updates.

---

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

### 3. Connection Configuration (Credentials)
You must authenticate the nodes with your data so n8n can access your files:

* **Google Sheets Trigger:** Connect your Google account and point to the spreadsheet file where survey responses are collected.
* **Google Drive (Download file):** Connect your Google account and paste the File ID of your PDF knowledge base (the ID can be found in the file's sharing link).
* **Google Gemini Chat Model:** Create new credentials and paste your API key from Google AI Studio. Ensure the model is set to `gemini-2.5-flash`.
* **Google Sheets (Append Row):** Point to the target spreadsheet where n8n should create new plans.

### 4. Activation
Once all nodes glow green after clicking `Execute Step,` switch the toggle in the top right from Inactive to Active. From this moment on, the system runs automatically in the background.

---

## 📖 Project Documentation (Assumptions & Reflection)
### 1. Problem
Creating personalized training and diet plans is pure, repetitive math that consumes a lot of time. Designing a professional 14-week plan requires generating and scheduling exactly 98 training days. Manually calculating safe mileage progression (10-15% week-over-week) and adjusting caloric needs for each of those 98 days takes a coach an average of 2-3 hours.
With only 10 clients, this adds up to 20-30 hours of "paperwork." Pre-made plans from the internet don't solve the problem because they lack variables (injuries, exact weight, weekly availability). This project solves this, reducing the time for creating a mathematically perfect plan from several hours to just **4–5 minutes** of automated background work.

### 2. Tools
The system was built with a focus on cost minimization and maximum flexibility:

* **Google Forms / Google Sheets:** As a free interface and database. They have native support for triggers in n8n.
* **Google Drive:** Serves as a simple hosting solution for the knowledge base (PDF manual). Changing the methodology only requires updating the file on Google Drive.
* **n8n:** A visual automation environment (node-based) that allows for custom JavaScript injection where ready-made integrations fall short.
* **Google Gemini 2.5 Flash (LLM):** A model designed for processing large context windows (RAG on PDFs), free for basic use, and more resilient to overload errors than preview versions.
* **JavaScript (Custom Code):** Used to write `try...catch` blocks and parsing functions for the raw LLM response, making the system immune to "formatting hallucinations."

### 3. Reflection and Challenges
Building the system revealed the limitations of Large Language Models in environments requiring strict mathematical logic.
* Prompt Engineering: The AI initially lost track of the calendar and added mileage chaotically. The solution was rigorous Prompt Engineering (forcing the model to think in 7-day blocks, setting a 35 km per workout limit, and hard-coding BMR equations).
* API Stability: The second challenge was API stability. Under high loads (generating JSON with 98 objects and reading dozens of PDF pages), servers rejected requests (503 error). Implementing a Retry On Fail mechanism stabilized the flow, proving that in automation, the "happy path" is just the beginning—handling errors is the key to success.

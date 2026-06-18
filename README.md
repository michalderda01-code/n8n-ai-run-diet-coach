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

Aby uruchomić ten projekt u siebie, wystarczy zaimportować gotowy plik przepływu (Workflow) i podpiąć własne konta.

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
* **Google Gemini 1.5 Flash (LLM):** Model stworzony do przetwarzania dużego okna kontekstowego (RAG na plikach PDF), darmowy w podstawowym użyciu i odporniejszy na błędy przeciążenia niż wersje *preview*.
* **JavaScript (Custom Code):** Wykorzystany do napisania bloku `try...catch` i funkcji parsowania surowej odpowiedzi LLM, uodparniając system na tzw. halucynacje formatowania.

### 3. Refleksja i Wyzwania
Budowa systemu ujawniła ograniczenia Dużych Modeli Językowych w środowisku wymagającym ścisłej logiki matematycznej. 
* AI początkowo gubiło kalendarz i dodawało kilometry w sposób chaotyczny. Rozwiązaniem okazał się rygorystyczny **Prompt Engineering** (wymuszenie myślenia systemem bloków 7-dniowych, wprowadzenie górnego limitu 35 km na jeden trening oraz twardych równań BMR).
* Drugim wyzwaniem była stabilność API. Przy dużych obciążeniach (generowanie JSON-a z 98 obiektami i czytanie kilkudziesięciu stron PDF) serwery odrzucały zapytania (błąd 503). Wdrożenie mechanizmu **Retry On Fail** (automatyczne ponawianie przy błędzie) ustabilizowało przepływ, dowodząc, że w automatyzacjach sam przepływ (happy path) to zaledwie początek sukcesu – kluczem jest odpowiednia obsługa błędów.
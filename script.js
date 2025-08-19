document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const startBtn = document.getElementById('startBtn');
  const maxNumberInput = document.getElementById('maxNumber');
  const workerCountSelect = document.getElementById('workerCount');
  const calcTypeSelect = document.getElementById('calcType');
  const progressPercent = document.getElementById('progressPercent');
  const workersContainer = document.getElementById('workersContainer');
  const totalPrimesElement = document.getElementById('totalPrimes');
  const executionTimeElement = document.getElementById('executionTime');
  const calculationSpeedElement = document.getElementById('calculationSpeed');
  
  // State
  let workers = [];
  let startTime;
  let isRunning = false;
  
  // Initialize worker cards
  function initializeWorkerCards(count) {
    workersContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const workerCard = document.createElement('div');
      workerCard.className = 'worker-card';
      workerCard.innerHTML = `
                <div class="worker-id">Worker ${i + 1}</div>
                <div class="worker-status">Menunggu</div>
                <div class="worker-time">-</div>
            `;
      workersContainer.appendChild(workerCard);
    }
  }
  
  // Update worker card
  function updateWorkerCard(index, status, time = 0) {
    const cards = workersContainer.querySelectorAll('.worker-card');
    if (index < cards.length) {
      const card = cards[index];
      const statusElem = card.querySelector('.worker-status');
      const timeElem = card.querySelector('.worker-time');
      
      statusElem.textContent = status;
      statusElem.style.color = status === 'Selesai' ? '#27ae60' : '#e67e22';
      
      if (time > 0) {
        timeElem.textContent = `${time.toFixed(2)} detik`;
      } else {
        timeElem.textContent = '-';
      }
    }
  }
  
  // Check if number is prime
  function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }
  
  // Create worker
  function createWorker() {
    const workerCode = `
            ${isPrime.toString()}
            
            self.onmessage = function(e) {
                const { start, end } = e.data;
                let result = 0;
                
                for (let i = start; i <= end; i++) {
                    if (isPrime(i)) result++;
                }
                
                self.postMessage(result);
            };
        `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }
  
  // Start calculation
  function startCalculation() {
    if (isRunning) return;
    
    // Reset state
    isRunning = true;
    workers = [];
    startBtn.disabled = true;
    progressPercent.textContent = '0%';
    totalPrimesElement.textContent = '0';
    executionTimeElement.textContent = '0 detik';
    calculationSpeedElement.textContent = '0 angka/detik';
    
    const maxNumber = parseInt(maxNumberInput.value);
    const workerCount = parseInt(workerCountSelect.value);
    const calcType = calcTypeSelect.value;
    
    // Initialize UI
    initializeWorkerCards(workerCount);
    
    // Show loading state
    for (let i = 0; i < workerCount; i++) {
      updateWorkerCard(i, 'Memuat...');
    }
    
    // Start timing
    startTime = performance.now();
    let completedWorkers = 0;
    let totalResult = 0;
    
    // Create workers
    for (let i = 0; i < workerCount; i++) {
      const worker = createWorker();
      workers.push(worker);
      
      // Calculate chunk
      const chunkSize = Math.ceil(maxNumber / workerCount);
      const start = i * chunkSize + 1;
      const end = Math.min((i + 1) * chunkSize, maxNumber);
      
      updateWorkerCard(i, 'Memproses');
      
      worker.postMessage({ start, end });
      
      worker.onmessage = function(e) {
        const workerIndex = workers.indexOf(worker);
        const workerTime = (performance.now() - startTime) / 1000;
        
        totalResult += e.data;
        completedWorkers++;
        
        updateWorkerCard(workerIndex, 'Selesai', workerTime);
        
        // Update progress
        const progress = Math.round((completedWorkers / workerCount) * 100);
        progressPercent.textContent = `${progress}%`;
        
        // If all workers completed
        if (completedWorkers === workerCount) {
          const endTime = performance.now();
          const totalTime = (endTime - startTime) / 1000;
          
          // Update results
          totalPrimesElement.textContent = totalResult.toLocaleString();
          executionTimeElement.textContent = `${totalTime.toFixed(2)} detik`;
          calculationSpeedElement.textContent =
            `${Math.round(maxNumber / totalTime).toLocaleString()} angka/detik`;
          
          // Terminate workers
          workers.forEach(w => w.terminate());
          workers = [];
          isRunning = false;
          startBtn.disabled = false;
        }
      };
      
      worker.onerror = function(error) {
        console.error('Worker error:', error);
        alert(`Worker error: ${error.message}`);
        isRunning = false;
        startBtn.disabled = false;
      };
    }
  }
  
  // Initialize worker cards based on default selection
  initializeWorkerCards(parseInt(workerCountSelect.value));
  
  // Event listeners
  startBtn.addEventListener('click', startCalculation);
  workerCountSelect.addEventListener('change', function() {
    initializeWorkerCards(parseInt(this.value));
  });
});
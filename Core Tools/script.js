document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const maxNumberInput = document.getElementById('maxNumber');
  const workerCountSelect = document.getElementById('workerCount');
  const calcTypeSelect = document.getElementById('calcType');
  const progressPercent = document.getElementById('progressPercent');
  const workersContainer = document.getElementById('workersContainer');
  const totalPrimesElement = document.getElementById('totalPrimes');
  const executionTimeElement = document.getElementById('executionTime');
  const calculationSpeedElement = document.getElementById('calculationSpeed');
  const resultLabel1 = document.getElementById('resultLabel1');
  const resultLabel2 = document.getElementById('resultLabel2');
  
  // State
  let workers = [];
  let startTime;
  let isRunning = false;
  let stopRequested = false;
  
  // Initialize worker cards
  function initializeWorkerCards(count) {
    workersContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const workerCard = document.createElement('div');
      workerCard.className = 'worker-card';
      workerCard.innerHTML = `
                <div class="worker-id">Core ${i + 1}</div>
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
      
      // Set color based on status
      if (status === 'Selesai') {
        statusElem.style.color = '#27ae60';
      } else if (status === 'Dibatalkan') {
        statusElem.style.color = '#e74c3c';
        statusElem.classList.add('cancelled-status');
      } else {
        statusElem.style.color = '#e67e22';
      }
      
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
  
  // Monte Carlo Pi approximation
  function monteCarloPi(numPoints) {
    let insideCircle = 0;
    
    for (let i = 0; i < numPoints; i++) {
      const x = Math.random();
      const y = Math.random();
      
      // Check if point is inside the circle
      if (x * x + y * y <= 1) {
        insideCircle++;
      }
    }
    
    return insideCircle;
  }
  
  // Create worker based on calculation type
  function createWorker(calcType) {
    let workerCode = '';
    
    if (calcType === 'prima') {
      workerCode = `
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
    } else if (calcType === 'montecarlo') {
      workerCode = `
            ${monteCarloPi.toString()}
            
            self.onmessage = function(e) {
                const { numPoints } = e.data;
                const result = monteCarloPi(numPoints);
                self.postMessage(result);
            };
        `;
    }
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }
  
  // Start calculation
  function startCalculation() {
    if (isRunning) return;
    
    // Reset state
    isRunning = true;
    stopRequested = false;
    workers = [];
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    startBtn.disabled = true;
    stopBtn.disabled = false;
    progressPercent.textContent = '0%';
    totalPrimesElement.textContent = '0';
    executionTimeElement.textContent = '0 detik';
    calculationSpeedElement.textContent = '0 angka/detik';
    
    const maxNumber = parseInt(maxNumberInput.value);
    const workerCount = parseInt(workerCountSelect.value);
    const calcType = calcTypeSelect.value;
    
    // Update UI labels based on calculation type
    if (calcType === 'prima') {
      resultLabel1.textContent = 'Total Bilangan Prima:';
      resultLabel2.textContent = 'Kecepatan:';
    } else if (calcType === 'montecarlo') {
      resultLabel1.textContent = 'Perkiraan Nilai Pi:';
      resultLabel2.textContent = 'Kecepatan:';
    }
    
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
      const worker = createWorker(calcType);
      workers.push(worker);
      
      // Calculate chunk based on calculation type
      let workerData;
      if (calcType === 'prima') {
        const chunkSize = Math.ceil(maxNumber / workerCount);
        const start = i * chunkSize + 1;
        const end = Math.min((i + 1) * chunkSize, maxNumber);
        workerData = { start, end };
      } else if (calcType === 'montecarlo') {
        const pointsPerWorker = Math.ceil(maxNumber / workerCount);
        workerData = { numPoints: pointsPerWorker };
      }
      
      updateWorkerCard(i, 'Memproses');
      worker.postMessage(workerData);
      
      worker.onmessage = function(e) {
        // Skip processing if stop requested
        if (stopRequested) return;
        
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
          
          // Update results based on calculation type
          if (calcType === 'prima') {
            totalPrimesElement.textContent = totalResult.toLocaleString();
            calculationSpeedElement.textContent =
              `${Math.round(maxNumber / totalTime).toLocaleString()} angka/detik`;
          } else if (calcType === 'montecarlo') {
            const piApproximation = (4 * totalResult) / maxNumber;
            totalPrimesElement.textContent = piApproximation.toFixed(10);
            calculationSpeedElement.textContent =
              `${Math.round(maxNumber / totalTime).toLocaleString()} titik/detik`;
          }
          
          executionTimeElement.textContent = `${totalTime.toFixed(2)} detik`;
          
          // Terminate workers
          workers.forEach(w => w.terminate());
          workers = [];
          isRunning = false;
          
          // Reset buttons
          startBtn.disabled = false;
          stopBtn.classList.add('hidden');
          startBtn.classList.remove('hidden');
        }
      };
      
      worker.onerror = function(error) {
        console.error('Core error:', error);
        alert(`Core error: ${error.message}`);
        isRunning = false;
        stopRequested = true;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        stopBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
      };
    }
  }
  
  // Stop calculation
  function stopCalculation() {
    if (!isRunning) return;
    
    stopRequested = true;
    stopBtn.disabled = true;
    
    // Terminate all workers and update UI
    workers.forEach((worker, index) => {
      worker.terminate();
      const workerTime = (performance.now() - startTime) / 1000;
      updateWorkerCard(index, 'Dibatalkan', workerTime);
    });
    
    workers = [];
    isRunning = false;
    
    // Reset UI
    setTimeout(() => {
      startBtn.disabled = false;
      stopBtn.classList.add('hidden');
      startBtn.classList.remove('hidden');
    }, 500);
  }
  
  // Initialize worker cards based on default selection
  initializeWorkerCards(parseInt(workerCountSelect.value));
  
  // Event listeners
  startBtn.addEventListener('click', startCalculation);
  stopBtn.addEventListener('click', stopCalculation);
  workerCountSelect.addEventListener('change', function() {
    initializeWorkerCards(parseInt(this.value));
  });
});
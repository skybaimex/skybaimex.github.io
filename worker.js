self.onmessage = function(event) {
    let num = event.data;
    let result = 0;
    
    // Simulasi perhitungan berat
    for (let i = 0; i < num; i++) {
        result += Math.sqrt(i);
    }

    self.postMessage(result);
};
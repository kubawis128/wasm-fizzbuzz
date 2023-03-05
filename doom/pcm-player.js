function initAudio(buffer,vol,pitch) {
    // specify your file and its audio properties
    const sampleRate = 11025
    const numChannels = 1 // mono or stereo
    const isFloat = false  // integer or floating point
  
  
    // create WAV header
    const [type, format] = isFloat ? [Float32Array, 3] : [Uint8Array, 1] 
    const wavHeader = new Uint8Array(buildWaveHeader({
      numFrames: buffer.byteLength / type.BYTES_PER_ELEMENT,
      bytesPerSample: type.BYTES_PER_ELEMENT,
      sampleRate,
      numChannels,
      format
    }))
  
    // create WAV file with header and downloaded PCM audio
    const wavBytes = new Uint8Array(wavHeader.length + buffer.byteLength)
    wavBytes.set(wavHeader, 0)
    wavBytes.set(new Uint8Array(buffer), wavHeader.length)
    
    // show audio player
    const blob = new Blob([wavBytes], { type: 'audio/wav' })
    //let audio = new Audio(URL.createObjectURL(blob))
    //audio.volume = vol / 10
   // audio.play()
    var audioContext = new AudioContext();
    let s = null
    audioContext.decodeAudioData(wavBytes.buffer,function(buffer) {
        var gainNode = audioContext.createGain()
        gainNode.gain.value = vol / 10
        gainNode.connect(audioContext.destination)

        var source = audioContext.createBufferSource()
        source.buffer = buffer
        source.detune.value = pitch - 128
        source.connect(gainNode);
        source.start(0);
        ((function(){}))()
    }, function(msg) {console.error(msg)})
   
    

  }
  
  
  // adapted from https://gist.github.com/also/900023
  function buildWaveHeader(opts) {
    const numFrames =      opts.numFrames;
    const numChannels =    opts.numChannels || 2;
    const sampleRate =     opts.sampleRate || 44100;
    const bytesPerSample = opts.bytesPerSample || 2;
    const format =         opts.format
  
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numFrames * blockAlign;
  
    const buffer = new ArrayBuffer(44);
    const dv = new DataView(buffer);
  
    let p = 0;
  
    function writeString(s) {
      for (let i = 0; i < s.length; i++) {
        dv.setUint8(p + i, s.charCodeAt(i));
      }
      p += s.length;
  }
  
    function writeUint32(d) {
      dv.setUint32(p, d, true);
      p += 4;
    }
  
    function writeUint16(d) {
      dv.setUint16(p, d, true);
      p += 2;
    }
  
    writeString('RIFF');              // ChunkID
    writeUint32(dataSize + 36);       // ChunkSize
    writeString('WAVE');              // Format
    writeString('fmt ');              // Subchunk1ID
    writeUint32(16);                  // Subchunk1Size
    writeUint16(format);              // AudioFormat
    writeUint16(numChannels);         // NumChannels
    writeUint32(sampleRate);          // SampleRate
    writeUint32(byteRate);            // ByteRate
    writeUint16(blockAlign);          // BlockAlign
    writeUint16(bytesPerSample * 8);  // BitsPerSample
    writeString('data');              // Subchunk2ID
    writeUint32(dataSize);            // Subchunk2Size
  
    return buffer;
  }
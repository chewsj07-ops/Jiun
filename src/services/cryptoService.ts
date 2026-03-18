export const cryptoService = {
  // Generate a random AES key (Master Key) and store it in localStorage if not exists
  async getMasterKey(): Promise<CryptoKey> {
    const keyStr = localStorage.getItem('zen_master_key');
    if (keyStr) {
      const keyBuffer = Uint8Array.from(atob(keyStr), c => c.charCodeAt(0));
      return await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );
    }

    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const exported = await crypto.subtle.exportKey('raw', key);
    const exportedStr = btoa(String.fromCharCode(...new Uint8Array(exported)));
    localStorage.setItem('zen_master_key', exportedStr);
    return key;
  },

  async encrypt(text: string): Promise<{ ciphertext: string; iv: string }> {
    const key = await this.getMasterKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    
    const ciphertextBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    
    return {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer))),
      iv: btoa(String.fromCharCode(...new Uint8Array(iv)))
    };
  },

  async decrypt(ciphertextStr: string, ivStr: string): Promise<string> {
    try {
      const key = await this.getMasterKey();
      const ciphertext = Uint8Array.from(atob(ciphertextStr), c => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0));
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );
      
      return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
      console.error('Decryption failed', e);
      return '【加密数据无法解密】';
    }
  }
};

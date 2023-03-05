use std::convert::TryInto;

#[link(wasm_import_module = "js")]
extern "C" {
    fn js_play_music(ptr: *const u8, size: u32, looping: u8);
}
#[link(wasm_import_module = "js")]
extern "C" {
    fn js_play_sound(ptr: *const u8, size: u32, vol:u8, sep:u8, pitch:u8) -> i32;
}

#[no_mangle]
extern "C" fn I_PlaySong(ptr: u8, size: u32, looping: u8) -> () {
    let music = unsafe { std::slice::from_raw_parts(sounds[0], size.try_into().unwrap()) };
    unsafe {
        js_play_music(music.as_ptr(), size, looping)
    }
}

#[no_mangle]
extern "C" fn I_StartSound(id: u8, data: u8, data_size: u32 ,vol:u8, sep:u8, pitch:u8, priority:u8) -> i32 {
    let sounde = unsafe { std::slice::from_raw_parts(sounds[id as usize], data_size.try_into().unwrap()) };
    unsafe {
        js_play_sound(sounde.as_ptr(), data_size, vol, sep, pitch)
    }
}

extern "C" {
    static sounds: [*const u8; 3000];
}
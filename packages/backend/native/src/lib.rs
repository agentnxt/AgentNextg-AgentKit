#![deny(clippy::all)]

mod utils;

pub mod doc_loader;
pub mod file_type;
pub mod hashcash;
pub mod html_sanitize;
pub mod tiktoken;

#[cfg(not(target_arch = "arm"))]
#[global_allocator]
static ALLOC: mimalloc::MiMalloc = mimalloc::MiMalloc;

#[macro_use]
extern crate napi_derive;

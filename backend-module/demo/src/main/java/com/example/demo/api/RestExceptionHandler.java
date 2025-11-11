package com.example.demo.api;

import com.example.demo.service.BusinessException;
import com.example.demo.service.NotFoundException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<?> notFound(NotFoundException e){
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
  }

  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<?> business(BusinessException e){
    return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> generic(Exception e){
    return ResponseEntity.status(500).body(Map.of("error","Erro interno"));
  }
}

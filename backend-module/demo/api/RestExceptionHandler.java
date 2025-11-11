@ExceptionHandler(jakarta.persistence.OptimisticLockException.class)
public ResponseEntity<?> optimistic(jakarta.persistence.OptimisticLockException e){
  return ResponseEntity.status(409).body(Map.of("error","Conflito de versão (otimistic lock)"));
}



def detectCycle(head)
    hash = {}
    ptr = head
  
    while ptr
      return ptr if hash[ptr]
      
      hash[ptr] = true
      ptr = ptr.next
    end
  end
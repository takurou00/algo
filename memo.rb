### 2分探索

# method
ary = [0, 4, 7, 10, 12]
ary.bsearch {|x| x >=   4 } # => 4
ary.bsearch {|x| x >=   6 } # => 7
ary.bsearch {|x| x >=  -1 } # => 0
ary.bsearch {|x| x >= 100 } # => nil

ary = [0, 4, 7, 10, 12]
ary.bsearch_index { |x| x >=   4 } # => 1
ary.bsearch_index { |x| x >=   6 } # => 2
ary.bsearch_index { |x| x >=  -1 } # => 0
ary.bsearch_index { |x| x >= 100 } # => nil

def binary_search(array,target)
  head = 0
  tail = array.length - 1

  while head <= tail 
    center = ((tail + tail) / 2)

     if array[center] == target 
        return center 
     elsif array[center] == < target
        head = center + 1
     else
        tail = center - 1
     end
  end
end
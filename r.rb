

def k_smallest_pairs(nums1, nums2, k)
    @nums1 = nums1
    @nums2 = nums2
  
    @queue = PriorityQueue.new
    pairs = []
  
    push(0, 0)
    while !@queue.empty? && pairs.size < k
      _, i, j = @queue.pop
      pairs << [nums1[i], nums2[j]]
      push(i, j + 1)
      push(i + 1, 0) if j == 0
    end
  
    pairs
  end
  
  def push(i, j)
    return if @nums1[i].nil? || @nums2[j].nil?
  
    sum = @nums1[i] + @nums2[j]
    @queue.push([sum, i, j], -sum)
  end
  

nums1 = [1,7,11]
nums2 = [2,4,6]
k = 3

k_smallest_pairs(nums1,nums2,k)
### hash
h = Hash.new(2)

### 式変形
as.each.with_index(1) { |a, i| h[i] = a }

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
     elsif array[center] < target
        head = center + 1
     else
        tail = center - 1
     end
  end
end

### 整数

## 最大公約数
2.gcd(2)                    # => 2
3.gcd(7)                    # => 1
3.gcd(-7)                   # => 1
((1<<31)-1).gcd((1<<61)-1)  # => 1

## 最小公倍数
2.lcm(2)                    # => 2
3.lcm(-7)                   # => 21
((1<<31)-1).lcm((1<<61)-1)  # => 4951760154835678088235319297

## ユークリッド互除

### 探索

## 幅優先

require 'set'

n = gets.chomp.to_i

done = Set[1]

g = {}

n.times {
	a, b = gets.split.map(&:to_i)
	if g.key?(a)
		g[a] << b
	else
		g[a] = [b]
	end
	if g.key?(b)
		g[b] << a
	else
		g[b] = [a]
	end
}

queue = []
queue.push(1)
done << 1

ans = 1
while !queue.empty?
	now = queue.shift
	if g.key?(now)
		to = g[now]
		to.each {|nv|
			if !done.include?(nv)
				queue.push(nv)
				done << nv
				ans = [ans, nv].max
			end
		}
	end
end
puts ans

## 深さ優先

#　再帰
def dfs(arr, searched, temp, node)
	searched[node] = true
	arr[node].each do |i|
	  next if searched[i]
	  temp[i] = node
  
	  # 子に対しても探索していく
	  dfs(arr, searched, temp, i)
	end
end

  n, x, y = gets.split.map(&:to_i)
  arr = Array.new(n + 1) { [] }
  (n - 1).times do
	u, v = gets.split.map(&:to_i)
	arr[u] << v
	arr[v] << u
  end
  
  # 探索済
  searched = Array.new(n + 1, false)
  
  # 親を記録
  temp = Array.new(n + 1, 0)
  
  dfs(arr, searched, temp, x)
  
  # 子から親へと逆算していく
  ans = [y]
  while ans[-1] != x
	ans << temp[ans[-1]]
  end

#   p searched
#   p temp 
#   p arr 
  puts ans.reverse.join(" ")

### ソート

## バブルソート
  for i in 0..6
	for j in 1..(7-i-1)
	  if k[j-1] > k[j]
		k[j-1],k[j] = k[j],k[j-1]
		ans += 1
	  end
	end
  end


  ### singly-linked list

  class ListNode
	    attr_accessor :val, :next
	    def initialize(val = 0, _next = nil)
	        @val = val
	        @next = _next
	    end
  end
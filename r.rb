

# $seen = Array.new(10**9,false)
# $seen[0] = true
# $result = [1]
# $e = {}

# def dfs(v)
#    $seen[v] = true 
#    $result.push(v)
#    if $e[v]
#      $e[v].each do |k|
#       dfs(k) if $seen[k] == false
#      end
#    end
# end

# n = gets.to_i 

# n.times do 
#    a,b = gets.chomp.split(" ").map(&:to_i)

#    if !$e[a]
#       $e[a] = []
#       $e[a].push(b)
#    else
#       $e[a].push(b)
#    end

#    if !$e[b]
#       $e[b] = []
#       $e[b].push(a)
#    else
#       $e[b].push(a)
#    end
# end

# dfs(1)

# puts $result.max

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

# puts ans

p g 









